import "./App.css";
import {
  LitNodeClient,
  encryptString,
  decryptToString,
} from "@lit-protocol/lit-node-client";
import { LitNetwork, RELAY_URL_CAYENNE } from "@lit-protocol/constants";
import {
  LitPKPResource,
  LitActionResource,
  generateAuthSig,
  createSiweMessageWithRecaps,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { LitAbility } from "@lit-protocol/types";
import { AuthCallbackParams } from "@lit-protocol/types";
import { ethers } from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LIT_CHAIN_RPC_URL, LIT_CHAINS } from "@lit-protocol/constants";
import { ethConnect, solConnect } from "@lit-protocol/auth-browser";
import { EOA_PRIVATE_KEY } from "./tests/config";
import { testDiscordAuthMethod, testDiscordlogin, authDiscordTest } from "./tests/testDiscordAuthMethod";
import { testGoogleAuthMethod, testGoogleLogin, authGoogleTest, mintMulti } from "./tests/testGoogleAuthMethod";

export const WALLET_CONNECT_PROJECT_ID = "34104ffa79c42bc7a3da115a421b80c7";

import {AuthMethodScope} from "@lit-protocol/constants";
import { GoogleProvider } from "@lit-protocol/lit-auth-client";

function connect() {
  
}

const createWithAuths = async () => {
};



function App() {




  const createWithAuths = async () => {
  };


  return (
    <>
      <h1>vite-react-lit-6.0</h1>
      <div className="card">
      <hr />
        <h3>Final Step</h3>
        <button onClick={async () => await mintMulti()}>
          mint with Multi Auth
        </button>
        <hr />
        <h3>Step 1</h3>
        <button onClick={async () => await testGoogleLogin()}>
          Test Google Login
        </button>
        <hr />
        <h3>Step 2</h3>
        <button onClick={async () => await authGoogleTest()}>
          Test Google Auth
        </button>
        <hr />
        <hr />
        <h3>Step 3</h3>
        <button onClick={async () => await testDiscordlogin()}>
          Test Discord Login
        </button>
        <hr />
        <hr />
        <h3>Step 4</h3>
        <button onClick={async () => await authDiscordTest()}>
          Test Discord Auth
        </button>
        <hr />
        <br />
        <button onClick={async () => await testDiscordAuthMethod()}>
          testDiscordAuthMethod
        </button>
        <hr />
        <button onClick={async () => await testGoogleAuthMethod()}>
          testGoogleAuthMethod
        </button>
        <hr />
        <button onClick={async () => await console.log(authDiscordTest)}>
          getSolanaAuthSig
        </button>
        <hr />
        {/* <button onClick={async () => await getCosmosAuthSig()}>
          getCosmosAuthSig
        </button> */}
        <hr />
      </div>
    </>
  );
}

export default App;
