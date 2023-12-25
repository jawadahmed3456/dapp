import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [notifications, setNotifications] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const addNotification = (message) => {
    setNotifications((prevNotifications) => [...prevNotifications, message]);
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(100);
        await tx.wait();
        getBalance();
        addNotification("Deposit successful!");
      } catch (error) {
        addNotification("Deposit failed. Please try again.");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(60);
        await tx.wait();
        getBalance();
        addNotification("Withdrawal successful!");
      } catch (error) {
        addNotification("Withdrawal failed. Please try again.");
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>

      {/* Deposit Section */}
      <section className="deposit-section">
        <h2>Deposit Section</h2>
        {initUser()}
        <button onClick={deposit}>Deposit 100 ETH</button>
      </section>

      {/* Withdrawal Section */}
      <section className="withdrawal-section">
        <h2>Withdrawal Section</h2>
        {initUser()}
        <button onClick={withdraw}>Withdraw 60 ETH</button>
      </section>

      {/* Notifications Section */}
      <section className="notifications-section">
        <h2>Notifications Section</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      </section>

      <style jsx>{`
        .container {
          text-align: center;
        }

        /* Deposit Section Styling */
        .deposit-section {
          background-color: #aaffaa; /* Light Green */
          padding: 20px;
          margin: 10px;
        }

        /* Withdrawal Section Styling */
        .withdrawal-section {
          background-color: #ffaaff; /* Light Purple */
          padding: 20px;
          margin: 10px;
        }

        /* Notifications Section Styling */
        .notifications-section {
          background-color: #ffffaa; /* Light Yellow */
          padding: 20px;
          margin: 10px;
        }
      `}
      </style>
    </main>
  );
}
