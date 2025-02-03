import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Calculator, ChevronLeft, Share2 } from 'lucide-react';

const PokerGame = () => {
  const [gameState, setGameState] = useState({
    ratio: '',
    buyIn: '',
    players: [
      { name: 'Player 1', buyIns: 1, chips: 0 },
      { name: 'Player 2', buyIns: 1, chips: 0 },
      { name: 'Player 3', buyIns: 1, chips: 0 },
      { name: 'Player 4', buyIns: 1, chips: 0 },
      { name: 'Player 5', buyIns: 1, chips: 0 }
    ],
    showResults: false,
    settlements: [],
    gameResults: []
  });

  useEffect(() => {
    const savedData = localStorage.getItem('pokerGameData');
    if (savedData) {
      setGameState(JSON.parse(savedData));
    }
  }, []);

  const saveGameData = (newState) => {
    localStorage.setItem('pokerGameData', JSON.stringify(newState));
    setGameState(newState);
  };

  const addPlayer = () => {
    const newState = {
      ...gameState,
      players: [...gameState.players, { name: `Player ${gameState.players.length + 1}`, buyIns: 1, chips: 0 }]
    };
    saveGameData(newState);
  };

  const removePlayer = (index) => {
    const newState = {
      ...gameState,
      players: gameState.players.filter((_, i) => i !== index)
    };
    saveGameData(newState);
  };

  const updatePlayerName = (index, name) => {
    const newPlayers = [...gameState.players];
    newPlayers[index] = { ...newPlayers[index], name };
    saveGameData({ ...gameState, players: newPlayers });
  };

  const updateBuyIns = (index, increment) => {
    const newPlayers = [...gameState.players];
    newPlayers[index] = { 
      ...newPlayers[index], 
      buyIns: Math.max(1, newPlayers[index].buyIns + increment)
    };
    saveGameData({ ...gameState, players: newPlayers });
  };

  const updateChips = (index, chips) => {
    const newPlayers = [...gameState.players];
    newPlayers[index] = { ...newPlayers[index], chips: Number(chips) };
    saveGameData({ ...gameState, players: newPlayers });
  };

  const resetGame = () => {
    const newState = {
      ratio: '',
      buyIn: '',
      players: [
        { name: 'Player 1', buyIns: 1, chips: 0 },
        { name: 'Player 2', buyIns: 1, chips: 0 },
        { name: 'Player 3', buyIns: 1, chips: 0 },
        { name: 'Player 4', buyIns: 1, chips: 0 },
        { name: 'Player 5', buyIns: 1, chips: 0 }
      ],
      showResults: false,
      settlements: [],
      gameResults: []
    };
    localStorage.removeItem('pokerGameData');
    setGameState(newState);
  };

  const calculateResults = () => {
    if (!gameState.ratio || !gameState.buyIn) {
      alert('Please fill in valid values for Ratio and Buy-In Amount.');
      return;
    }

    const results = gameState.players.map(player => {
      const money = player.chips / Number(gameState.ratio);
      const totalBuyIn = player.buyIns * Number(gameState.buyIn);
      const balance = money - totalBuyIn;
      return {
        ...player,
        money: parseFloat(money.toFixed(2)),
        totalBuyIn: parseFloat(totalBuyIn.toFixed(2)),
        balance: parseFloat(balance.toFixed(2))
      };
    });

    const creditors = results.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = results.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
    const settlements = [];

    while (creditors.length > 0 && debtors.length > 0) {
      const creditor = creditors[0];
      const debtor = debtors[0];
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: parseFloat(amount.toFixed(2))
      });

      creditor.balance = parseFloat((creditor.balance - amount).toFixed(2));
      debtor.balance = parseFloat((debtor.balance + amount).toFixed(2));

      if (creditor.balance <= 0) creditors.shift();
      if (debtor.balance >= 0) debtors.shift();
    }

    const biggestLoser = results.reduce((prev, current) => 
      (current.balance < prev.balance) ? current : prev
    );

    const resultsWithSheep = results.map(player => ({
      ...player,
      name: player.name === biggestLoser.name ? `${player.name} 🐑` : player.name
    }));

    saveGameData({
      ...gameState,
      showResults: true,
      gameResults: resultsWithSheep,
      settlements
    });
  };

  return (
    <div>
      {/* UI Elements go here */}
    </div>
  );
};

export default PokerGame;
