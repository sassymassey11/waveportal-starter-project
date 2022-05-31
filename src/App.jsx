import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x2c4aa4b650BC1825620c0D2DEa9B18de96496263";
  const contractABI = abi.abi;
  const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [contract, setContract] = useState([]);
  
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
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getContract = async () => {
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        let wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let balance = await provider.getBalance(contractAddress);
        console.log("Contract Address: " + wavePortalContract.address + " with Balance: " + balance);
        return wavePortalContract;
      }
    }
    catch(error){
      console.log(error);
    }
  }
  
  const getTotalWaves = async (contract) => {
    let count = await contract.getTotalWaves();
    console.log("Total Waves: " + count.toNumber());
    setTotalWaves(count);
  }

  const getAllWaves = async (contract) => {
    const waves = await contract.getAllWaves();

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
      
      console.log("Available functions: " , contract.functions);

      const waveTxn = await contract.wave("This is a message!");
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
    const fetchContract = async () => {
      const waveContract = await getContract();
      await setContract(waveContract);
      return waveContract;
    }

    fetchContract()
      .then((contract) => {
      checkIfWalletIsConnected();
      getTotalWaves(contract);
      getAllWaves(contract);
      })     
      .catch(console.error);    
  }, [])

  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        Pets of Web3
        </div>

        <div className="bio">
          Got a furry, scaly, or feathered friend? Onboard your pet today!
        </div>

        {currentAccount && (
          <button className="waveButton" onClick={wave}>
          Onboard your pet!
          </button>
        )}


        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="bio">
        Pets onboarded: { parseInt(totalWaves) }
        </div>

        
        {allWaves.map((wave, index) => {
          return (
            <div key={index} class="polaroid center">
              
                <img class="petImage" src="Callisto.JPG"/>
                <div>Name:</div>
                <div>Age: </div>
                <div>Favorite Toy: </div>
              
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App