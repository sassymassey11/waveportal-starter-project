import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x516B7256F74B1C58D343528c04cC2d84e79D8527";
  const contractABI = abi.abi;
  const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getContract = async () => {
    const {ethereum} = window;
    if (ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        let wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      return wavePortalContract;
  }
}
  
  const getTotalWaves = async () => {
    let contract = await getContract();
    let count = await contract.getTotalWaves();
    console.log("Total Waves: " + count.toNumber());
    setTotalWaves(count);
  }

  const getAllWaves = async () => {
    const wavePortalContract = await getContract();
    const waves = await wavePortalContract.getAllWaves();

    let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
          });
    });
    setAllWaves(wavesCleaned);
}
  

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      let wavePortalContract = await getContract();
      console.log(wavePortalContract.functions);

      const waveTxn = await wavePortalContract.wave("This is a message!");
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      await getTotalWaves();
      await getAllWaves();

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    getTotalWaves();
    getAllWaves();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        Pets of Web3
        </div>

        <div className="bio">
          Got a furry, scaly, or feathered friend? Connect your Ethereum wallet to join Pets of Web3 today!
        </div>
        <div>
        Pets onboarded: { parseInt(totalWaves) }</div>
        <button className="waveButton" onClick={wave}>
          Onboard your pet!
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App