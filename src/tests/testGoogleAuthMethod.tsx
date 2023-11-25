import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LitAbility } from "@lit-protocol/types";
import { AuthCallbackParams } from "@lit-protocol/types";
import { ethers } from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { GoogleProvider, DiscordProvider, LitAuthClient } from "@lit-protocol/lit-auth-client";
import {
  RELAY_URL_CAYENNE,
  ProviderType,
  LIT_CHAIN_RPC_URL,
} from "@lit-protocol/constants";

import { AuthMethodScope } from "@lit-protocol/constants";
import { EOA_PRIVATE_KEY } from "./config";


export const testGoogleLogin = async () => {

  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.Cayenne,
    debug: true,
  })

  await litNodeClient.connect();

  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayUrl: RELAY_URL_CAYENNE,
      relayApiKey: "098f6bcd4621d373cade4e832627b4f6",
    },
    litNodeClient,
  });

  //Setup the authentication method
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
    //specify the type is google
        ProviderType.Google
      );
    
      //Log returns a object {} shows redirect URL, relay point to - mint next and add auth, rpcUrl
      console.log("✅ googleProvider initialized!", googleProvider);
    
    //-------------------------------------------------
      /**
       * ========== Sign in Google ==========
       */
      // If ?provider=google is not found in the URL, redirect to Discord 
      const url = new URL(window.location.href);
      if (url.searchParams.get("provider") !== "google") {
        console.log("Signing in with Google...");
        googleProvider.signIn();
      }
}

export const authGoogleTest = async () => {


  // Find the Rpc - remote procedure call
  const rpcProvider = new ethers.providers.JsonRpcProvider(LIT_CHAIN_RPC_URL);
// Set up wallet connecting, this one takes private key, can replace with prompt
  const ethersWallet = new ethers.Wallet(EOA_PRIVATE_KEY, rpcProvider);

//Initializing lit contract client
  const litContractsClient = new LitContracts({
    network: LitNetwork.Cayenne,
    signer: ethersWallet,
    debug: true,
  });

  //Await #2
  await litContractsClient.connect();  

  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.Cayenne,
    debug: true,
  })

  await litNodeClient.connect();

  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayUrl: RELAY_URL_CAYENNE,
      relayApiKey: "098f6bcd4621d373cade4e832627b4f6",
    },
    litNodeClient,
  });
  //Setup the authentication method
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
  //specify the type is google
        ProviderType.Google
    );

  const googleAuthMethod = await googleProvider.authenticate();
  console.log("✅ googleProvider initialized!", googleProvider);

    console.log("✅ googleProvider initialized!", googleProvider);
    console.log("✅ googleProvider googleAuthMethod:", googleAuthMethod);

  localStorage.setItem('google', JSON.stringify(googleAuthMethod));

} 

export const mintMulti = async () => {
  
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.Cayenne,
    debug: true,
  })

  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayUrl: RELAY_URL_CAYENNE,
      relayApiKey: "098f6bcd4621d373cade4e832627b4f6",
    },
    litNodeClient,
  });

  await litNodeClient.connect();
  const rpcProvider = new ethers.providers.JsonRpcProvider(LIT_CHAIN_RPC_URL);
  // Set up wallet connecting, this one takes private key, can replace with prompt
    const ethersWallet = new ethers.Wallet(EOA_PRIVATE_KEY, rpcProvider);
  
  //Initializing lit contract client
    const litContractsClient = new LitContracts({
      network: LitNetwork.Cayenne,
      signer: ethersWallet,
      debug: true,
    });

    const data = localStorage.getItem('google');
    const googleAuthMethod = JSON.parse(String(data));
    console.log(googleAuthMethod);
    const data2 = localStorage.getItem('discord');
    const discordAuthMethod = JSON.parse(String(data2));
    console.log(discordAuthMethod)

    //Await #2
    await litContractsClient.connect();
  //connection to functions/contracts/manipulatons
    console.log("litContractsClient:", litContractsClient);
  
    const { capacityTokenIdStr } =
  //Await #3, wait for the contract to mint the capacity credit
      await litContractsClient.mintCapacityCreditsNFT({
        requestsPerKilosecond: 100,
        daysUntilUTCMidnightExpiration: 2,
      });
  // Id of capacity Token
    console.log("capacityTokenIdStr:", capacityTokenIdStr);
  
    const capacityDelegationAuthSig = await (
  //Await #4&5, Waits for the creation of an auth sig
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId: capacityTokenIdStr,
      })
    ).capacityDelegationAuthSig;
  
    // Returns ethereum / private key address minted with, a signature
    console.log("capacityDelegationAuthSig:", capacityDelegationAuthSig);
// 
  //Minting a PKP
    const googlediscordAuthMethodOwnedPkp = await litAuthClient.mintPKPWithAuthMethods(
      [JSON.parse(String(data)), JSON.parse(String(data2))],
      {
        pkpPermissionScopes: [[AuthMethodScope.SignAnything], [AuthMethodScope.SignAnything]],  // PKP Permission Scopes
        sendPkpToitself: true,   // whether to send PKP to itself or not
        addPkpEthAddressAsPermittedAddress: true,  // whether to add PKP eth address as permitted address or not
      }
    )

    console.log(googlediscordAuthMethodOwnedPkp);

    console.log("✅ Signing With Google Auth");
    const googlesessionSigs = await litNodeClient.getSessionSigs({
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      capacityDelegationAuthSig: capacityDelegationAuthSig,
      authNeededCallback: async (props: AuthCallbackParams) => {
        console.log("authNeededCallback props:", props);

        const response = await litNodeClient.signSessionKey({
          sessionKey: props.sessionKey,
          statement: props.statement || "Some custom statement.",
          authMethods: [JSON.parse(String(data2))], //can use either googleauthmethod or discord authmethod to sign with public key.
          pkpPublicKey: googlediscordAuthMethodOwnedPkp.pkpPublicKey,
          expiration: props.expiration,
          resources: props.resources,
          chainId: 1,
          resourceAbilityRequests: props.resourceAbilityRequests,
        });

        return response.authSig;
      },
    });
    console.log("✅ sessionSigs:", googlesessionSigs);
    /**
     * ========== pkp sign  ==========
     */
    console.log("PKP Signing...");
    const googlepkpRes = await litNodeClient.pkpSign({
      sessionSigs: googlesessionSigs,
      pubKey: googlediscordAuthMethodOwnedPkp.pkpPublicKey as string,
      toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
    });

    console.log(googlepkpRes);
}


// declare and exported the function
export const testGoogleAuthMethod = async () => {
  console.log("testGoogleAuthMethod");

  /**
   * ========== Node Set Up ==========
   */

//------------------------------------------------------------

//connect to the lit client, important to get to the contract
  const litNodeClient = new LitNodeClient({
//specify the network to connect to
    litNetwork: LitNetwork.Cayenne,
    debug: true,
  });

// Await #1 this has to happen first
  await litNodeClient.connect();

  /**
   * ========== Lit Auth Client ==========
   */
//Creating a client to authenticate based on our method
  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
//Points to connect to a auth client
      relayUrl: RELAY_URL_CAYENNE,
      relayApiKey: "098f6bcd4621d373cade4e832627b4f6",
    },
    litNodeClient,
  });

//--------------------------------------------------

  /**
   * ========== Specify google/auth provider ==========
   */

  // -- get google auth method
  //Setup the authentication method
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
//specify the type is google
    ProviderType.Google
  );

  //Log returns a object {} shows redirect URL, relay point to - mint next and add auth, rpcUrl
  console.log("✅ googleProvider initialized!", googleProvider);

//-------------------------------------------------
  /**
   * ========== Sign in Google ==========
   */
  // If ?provider=discord is not found in the URL, redirect to Discord OAuth
  const url = new URL(window.location.href);
  if (url.searchParams.get("provider") !== "google") {
    console.log("Signing in with Discord...");
    googleProvider.signIn();
  }
// Stop of the sign in 
//---------------------------------------------------


//-------------------------------------------------------
  /**
   * ========== Authenticate ==========
   */
  console.log("Google is signed in! Authenticating...");

  // Handle authentication
  const googleAuthMethod = await googleProvider.authenticate();
//Returns an method type and access token, type {}
  console.log("✅ googleProvider googleAuthMethod:", googleAuthMethod);

// --------------------------------------------------------



  /**
   * ========== Lit Contracts SDK to create a capacity delegation authSig ==========
   */

  // Find the Rpc - remote procedure call
  const rpcProvider = new ethers.providers.JsonRpcProvider(LIT_CHAIN_RPC_URL);
// Set up wallet connecting, this one takes private key, can replace with prompt
  const ethersWallet = new ethers.Wallet(EOA_PRIVATE_KEY, rpcProvider);

//Initializing lit contract client
  const litContractsClient = new LitContracts({
    network: LitNetwork.Cayenne,
    signer: ethersWallet,
    debug: true,
  });

  //Await #2
  await litContractsClient.connect();
//connection to functions/contracts/manipulatons
  console.log("litContractsClient:", litContractsClient);

  const { capacityTokenIdStr } =
//Await #3, wait for the contract to mint the capacity credit
    await litContractsClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 100,
      daysUntilUTCMidnightExpiration: 2,
    });
// Id of capacity Token
  console.log("capacityTokenIdStr:", capacityTokenIdStr);

  const capacityDelegationAuthSig = await (
//Await #4&5, Waits for the creation of an auth sig
    await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: ethersWallet,
      capacityTokenId: capacityTokenIdStr,
    })
  ).capacityDelegationAuthSig;

  // Returns ethereum / private key address minted with, a signature
  console.log("capacityDelegationAuthSig:", capacityDelegationAuthSig);

//Minting a PKP
  const googleAuthMethodOwnedPkp = (
  // Await #6, wait for a mint with the auth sig generated above
    await litContractsClient.mintWithAuth({
//our google auth method from earlier
      authMethod: googleAuthMethod,
//The auth method scope of the PKP/NFT, Signanything allows the auth method to sign any data!
      scopes: [AuthMethodScope.SignAnything],
    })
  ).pkp;

  // Returns ethaddress, publickey, and token ID
  console.log("googleAuthMethodOwnedPkp:", googleAuthMethodOwnedPkp);


  /**
   * ========== Get Session Sigs  ==========
   */
  console.log("Getting session sigs...");
  // Comes fro node client, not the contract client


  // THIS IS ONE BIG FUNCTION
  const sessionSigs = await litNodeClient.getSessionSigs({
    resourceAbilityRequests: [
      {
// ability of the session keyPair to sign
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
// the ability of the session keypair to execute lit actions
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
//This sig goes with the session key to verify the auth method is allowed to sign
    capacityDelegationAuthSig: capacityDelegationAuthSig,
    authNeededCallback: async (props: AuthCallbackParams) => {
      console.log("authNeededCallback props:", props);
// Do an action with your session key
      const response = await litNodeClient.signSessionKey({
// Gives session key
        sessionKey: props.sessionKey,
//Some data
        statement: props.statement || "Lets see what this does.",
//Our authentication method
        authMethods: [googleAuthMethod],
//Our pkp - maybe for verification
        pkpPublicKey: "0x" + googleAuthMethodOwnedPkp.publicKey,
//Expiration - unkonwn
        expiration: props.expiration,
//Specified above, somehow it knows the resources?
        resources: props.resources,
        chainId: 1,
        resourceAbilityRequests: props.resourceAbilityRequests,
      });
      return response.authSig;
    },
  });


  console.log("✅ sessionSigs:", sessionSigs);

  /**
   * ========== pkp sign  ==========
   */
  console.log("PKP Signing...");
  const pkpRes = await litNodeClient.pkpSign({
    sessionSigs: sessionSigs,
    pubKey: googleAuthMethodOwnedPkp.publicKey,
//Can't hange the keccak to a string
    toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
  });

  console.log("✅ pkpSign response:", pkpRes);
};
