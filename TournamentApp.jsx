// Poker Tournament UI Components
// These React components would provide the front-end interface for the tournament management app

import React, { useState, useEffect, useCallback } from 'react';
import './TournamentApp.css';

// Tournament Setup Component
const TournamentSetup = ({ onSave }) => {
  const [formData, setFormData] = useState({
    tournamentName: '',
    buyInAmount: 100,
    startingChips: 10000,
    rebuyAmount: 100,
    rebuyChips: 10000,
    maxRebuyLevel: 6,
    addonAmount: 100,
    addonChips: 10000,
    maxAddonLevel: 6,
    breakInterval: 4,
    breakDuration: 15
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Amount') || name.includes('Chips') || name.includes('Level') || 
              name.includes('Interval') || name.includes('Duration') ? 
              parseInt(value, 10) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="tournament-setup">
      <h2>Tournament Setup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tournament Name</label>
          <input 
            type="text" 
            name="tournamentName" 
            value={formData.tournamentName} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Buy-in Amount ($)</label>
            <input 
              type="number" 
              name="buyInAmount" 
              value={formData.buyInAmount} 
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Starting Chips</label>
            <input 
              type="number" 
              name="startingChips" 
              value={formData.startingChips} 
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Rebuy Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Rebuy Amount ($)</label>
              <input 
                type="number" 
                name="rebuyAmount" 
                value={formData.rebuyAmount} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Rebuy Chips</label>
              <input 
                type="number" 
                name="rebuyChips" 
                value={formData.rebuyChips} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Last Rebuy Level</label>
              <input 
                type="number" 
                name="maxRebuyLevel" 
                value={formData.maxRebuyLevel} 
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Add-on Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Add-on Amount ($)</label>
              <input 
                type="number" 
                name="addonAmount" 
                value={formData.addonAmount} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Add-on Chips</label>
              <input 
                type="number" 
                name="addonChips" 
                value={formData.addonChips} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Last Add-on Level</label>
              <input 
                type="number" 
                name="maxAddonLevel" 
                value={formData.maxAddonLevel} 
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Break Settings</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Break Interval (levels)</label>
              <input 
                type="number" 
                name="breakInterval" 
                value={formData.breakInterval} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Break Duration (minutes)</label>
              <input 
                type="number" 
                name="breakDuration" 
                value={formData.breakDuration} 
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">Save Tournament Settings</button>
      </form>
    </div>
  );
};

// Table and Seating Component
const TableSeating = ({ tournament, onUpdate }) => {
  const [tables, setTables] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [showPlayerList, setShowPlayerList] = useState(false);

  useEffect(() => {
    if (tournament && tournament.tables) {
      setTables(tournament.tables);
    }
  }, [tournament]);

  const addTable = () => {
    if (newTableName.trim() === '') return;
    
    const newTable = {
      id: newTableName.trim(),
      maxSeats: 9,
      seats: Array(9).fill(null)
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    onUpdate('tables', updatedTables);
    setNewTableName('');
  };

  const removeTable = (tableId) => {
    // Check if table has players
    const tableToRemove = tables.find(table => table.id === tableId);
    const hasPlayers = tableToRemove.seats.some(seat => seat !== null);
    
    if (hasPlayers) {
      if (!window.confirm("This table has assigned players. Remove anyway?")) {
        return;
      }
      
      // Unassign players from the table
      const updatedPlayers = tournament.players.map(player => {
        if (player.tableId === tableId) {
          return {
            ...player,
            tableId: null,
            seatNumber: null
          };
        }
        return player;
      });
      
      onUpdate('players', updatedPlayers);
    }
    
    const updatedTables = tables.filter(table => table.id !== tableId);
    setTables(updatedTables);
    onUpdate('tables', updatedTables);
  };

  const getPlayerById = (playerId) => {
    return tournament.players.find(player => player.id === playerId);
  };

  const getAvailablePlayers = () => {
    return tournament.players.filter(
      player => player.status === 'active' && player.tableId === null
    );
  };

  const assignPlayerToSeat = (tableId, seatNumber, playerId) => {
    // Update tables
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        const updatedSeats = [...table.seats];
        updatedSeats[seatNumber - 1] = playerId;
        return {
          ...table,
          seats: updatedSeats
        };
      }
      return table;
    });
    
    // Update player
    const updatedPlayers = tournament.players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          tableId: tableId,
          seatNumber: seatNumber
        };
      }
      return player;
    });
    
    setTables(updatedTables);
    onUpdate('tables', updatedTables);
    onUpdate('players', updatedPlayers);
    
    // Reset selections
    setSelectedPlayer(null);
    setSelectedTable(null);
    setSelectedSeat(null);
    setShowPlayerList(false);
  };

  const removePlayerFromSeat = (tableId, seatNumber) => {
    // Find the player in this seat
    const table = tables.find(t => t.id === tableId);
    const playerId = table.seats[seatNumber - 1];
    
    if (!playerId) return;
    
    // Update tables
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        const updatedSeats = [...table.seats];
        updatedSeats[seatNumber - 1] = null;
        return {
          ...table,
          seats: updatedSeats
        };
      }
      return table;
    });
    
    // Update player
    const updatedPlayers = tournament.players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          tableId: null,
          seatNumber: null
        };
      }
      return player;
    });
    
    setTables(updatedTables);
    onUpdate('tables', updatedTables);
    onUpdate('players', updatedPlayers);
  };

  const randomizeSeating = () => {
    if (tables.length === 0) {
      alert("Please create at least one table first.");
      return;
    }
    
    // Get active players
    const activePlayers = tournament.players.filter(p => p.status === 'active');
    
    if (activePlayers.length === 0) {
      alert("No active players to assign.");
      return;
    }
    
    // Calculate how many tables we need
    const totalPlayers = activePlayers.length;
    const maxPlayersPerTable = 9;
    const numTables = Math.min(
      Math.ceil(totalPlayers / maxPlayersPerTable),
      tables.length
    );
    
    if (numTables < Math.ceil(totalPlayers / maxPlayersPerTable)) {
      alert(`Warning: You need at least ${Math.ceil(totalPlayers / maxPlayersPerTable)} tables for ${totalPlayers} players. Some players will not be assigned.`);
    }
    
    // Shuffle players
    const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5);
    
    // Clear all table assignments
    const clearedTables = tables.map(table => ({
      ...table,
      seats: Array(table.maxSeats).fill(null)
    }));
    
    // Reset all player table assignments
    const clearedPlayers = tournament.players.map(player => ({
      ...player,
      tableId: null,
      seatNumber: null
    }));
    
    // Now assign players to tables
    let assignedPlayers = [...clearedPlayers];
    let assignedTables = [...clearedTables];
    
    // Use only the number of tables we need
    const usableTables = assignedTables.slice(0, numTables);
    
    shuffledPlayers.forEach((player, index) => {
      if (index >= usableTables.length * maxPlayersPerTable) {
        // Skip if we've run out of seats
        return;
      }
      
      const tableIndex = index % usableTables.length;
      const table = usableTables[tableIndex];
      
      // Find first available seat at this table
      const availableSeats = table.seats
        .map((seat, idx) => (seat === null ? idx + 1 : null))
        .filter(seat => seat !== null);
      
      if (availableSeats.length === 0) {
        // No seats available at this table (shouldn't happen with our distribution)
        return;
      }
      
      // Randomize seat selection
      const randomSeatIndex = Math.floor(Math.random() * availableSeats.length);
      const seatNumber = availableSeats[randomSeatIndex];
      
      // Assign player to seat
      assignedTables = assignedTables.map(t => {
        if (t.id === table.id) {
          const updatedSeats = [...t.seats];
          updatedSeats[seatNumber - 1] = player.id;
          return {
            ...t,
            seats: updatedSeats
          };
        }
        return t;
      });
      
      // Update player's table and seat
      assignedPlayers = assignedPlayers.map(p => {
        if (p.id === player.id) {
          return {
            ...p,
            tableId: table.id,
            seatNumber: seatNumber
          };
        }
        return p;
      });
    });
    
    setTables(assignedTables);
    onUpdate('tables', assignedTables);
    onUpdate('players', assignedPlayers);
  };

  const handleSelectSeat = (tableId, seatNumber) => {
    setSelectedTable(tableId);
    setSelectedSeat(seatNumber);
    setShowPlayerList(true);
  };

  const balanceTables = () => {
    if (tables.length <= 1) {
      alert("Need at least two tables to balance.");
      return;
    }
    
    // Count players at each table
    const tableCounts = tables.map(table => ({
      tableId: table.id,
      playerCount: table.seats.filter(seat => seat !== null).length
    }));
    
    // Sort tables by player count (descending)
    tableCounts.sort((a, b) => b.playerCount - a.playerCount);
    
    // If tables are already balanced (diff <= 1), do nothing
    if (tableCounts[0].playerCount - tableCounts[tableCounts.length - 1].playerCount <= 1) {
      alert("Tables are already balanced.");
      return;
    }
    
    // Start moving players from most populated to least populated tables
    let updated = false;
    let updatedTables = [...tables];
    let updatedPlayers = [...tournament.players];
    
    while (true) {
      // Recalculate table counts after each move
      const newTableCounts = updatedTables.map(table => ({
        tableId: table.id,
        playerCount: table.seats.filter(seat => seat !== null).length
      }));
      
      newTableCounts.sort((a, b) => b.playerCount - a.playerCount);
      
      // If balanced, break
      if (newTableCounts[0].playerCount - newTableCounts[newTableCounts.length - 1].playerCount <= 1) {
        break;
      }
      
      // Get the most and least populated tables
      const sourceTableId = newTableCounts[0].tableId;
      const targetTableId = newTableCounts[newTableCounts.length - 1].tableId;
      
      // Find a player to move from source table
      const sourceTable = updatedTables.find(t => t.id === sourceTableId);
      const playerIdToMove = sourceTable.seats.find(seat => seat !== null);
      
      if (!playerIdToMove) {
        break; // Something went wrong
      }
      
      // Find an available seat at target table
      const targetTable = updatedTables.find(t => t.id === targetTableId);
      const availableSeatIndex = targetTable.seats.findIndex(seat => seat === null);
      
      if (availableSeatIndex === -1) {
        break; // No available seats
      }
      
      // Move the player
      // Update source table
      updatedTables = updatedTables.map(table => {
        if (table.id === sourceTableId) {
          const updatedSeats = [...table.seats];
          const seatIndex = updatedSeats.findIndex(seat => seat === playerIdToMove);
          updatedSeats[seatIndex] = null;
          return {
            ...table,
            seats: updatedSeats
          };
        }
        return table;
      });
      
      // Update target table
      updatedTables = updatedTables.map(table => {
        if (table.id === targetTableId) {
          const updatedSeats = [...table.seats];
          updatedSeats[availableSeatIndex] = playerIdToMove;
          return {
            ...table,
            seats: updatedSeats
          };
        }
        return table;
      });
      
      // Update player
      updatedPlayers = updatedPlayers.map(player => {
        if (player.id === playerIdToMove) {
          return {
            ...player,
            tableId: targetTableId,
            seatNumber: availableSeatIndex + 1
          };
        }
        return player;
      });
      
      updated = true;
    }
    
    if (updated) {
      setTables(updatedTables);
      onUpdate('tables', updatedTables);
      onUpdate('players', updatedPlayers);
      alert("Tables balanced successfully.");
    } else {
      alert("Could not balance tables further.");
    }
  };

  return (
    <div className="table-seating">
      <h2>Table Management</h2>
      
      <div className="table-controls">
        <div className="add-table-form">
          <input
            type="text"
            placeholder="Enter table name"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
          />
          <button onClick={addTable} className="btn btn-primary">Add Table</button>
        </div>
        
        <div className="table-actions">
          <button onClick={randomizeSeating} className="btn btn-warning">Randomize Seating</button>
          <button onClick={balanceTables} className="btn btn-info">Balance Tables</button>
        </div>
      </div>
      
      <div className="tables-container">
        {tables.map(table => (
          <div className="poker-table" key={table.id}>
            <div className="table-header">
              <h3>{table.id}</h3>
              <button onClick={() => removeTable(table.id)} className="btn btn-danger">
                Remove Table
              </button>
            </div>
            
            <div className="table-layout">
              {/* Visualize a poker table with 9 seats */}
              <div className="seat seat-1">
                {table.seats[0] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 1)}>
                    {getPlayerById(table.seats[0])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 1)}>
                    Seat 1
                  </div>
                )}
              </div>
              
              <div className="seat seat-2">
                {table.seats[1] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 2)}>
                    {getPlayerById(table.seats[1])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 2)}>
                    Seat 2
                  </div>
                )}
              </div>
              
              <div className="seat seat-3">
                {table.seats[2] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 3)}>
                    {getPlayerById(table.seats[2])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 3)}>
                    Seat 3
                  </div>
                )}
              </div>
              
              <div className="seat seat-4">
                {table.seats[3] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 4)}>
                    {getPlayerById(table.seats[3])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 4)}>
                    Seat 4
                  </div>
                )}
              </div>
              
              <div className="seat seat-5">
                {table.seats[4] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 5)}>
                    {getPlayerById(table.seats[4])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 5)}>
                    Seat 5
                  </div>
                )}
              </div>
              
              <div className="seat seat-6">
                {table.seats[5] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 6)}>
                    {getPlayerById(table.seats[5])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 6)}>
                    Seat 6
                  </div>
                )}
              </div>
              
              <div className="seat seat-7">
                {table.seats[6] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 7)}>
                    {getPlayerById(table.seats[6])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 7)}>
                    Seat 7
                  </div>
                )}
              </div>
              
              <div className="seat seat-8">
                {table.seats[7] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 8)}>
                    {getPlayerById(table.seats[7])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 8)}>
                    Seat 8
                  </div>
                )}
              </div>
              
              <div className="seat seat-9">
                {table.seats[8] ? (
                  <div className="player-chip" onClick={() => removePlayerFromSeat(table.id, 9)}>
                    {getPlayerById(table.seats[8])?.name}
                  </div>
                ) : (
                  <div className="empty-seat" onClick={() => handleSelectSeat(table.id, 9)}>
                    Seat 9
                  </div>
                )}
              </div>
              
              <div className="table-center">{table.id}</div>
            </div>
          </div>
        ))}
      </div>
      
      {showPlayerList && (
        <div className="player-selection-modal">
          <div className="modal-content">
            <h3>Select Player for Table {selectedTable}, Seat {selectedSeat}</h3>
            
            <div className="available-players">
              {getAvailablePlayers().length > 0 ? (
                getAvailablePlayers().map(player => (
                  <div 
                    key={player.id} 
                    className="player-option"
                    onClick={() => assignPlayerToSeat(selectedTable, selectedSeat, player.id)}
                  >
                    {player.name} - {player.chips.toLocaleString()} chips
                  </div>
                ))
              ) : (
                <p>No available players to assign.</p>
              )}
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowPlayerList(false);
                setSelectedTable(null);
                setSelectedSeat(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Tournament Clock Component
const TournamentClock = ({ tournament, onUpdate }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [status, setStatus] = useState('setup');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (tournament) {
      setTimeRemaining(tournament.timeRemaining || 0);
      setStatus(tournament.status || 'setup');
      setCurrentLevel(tournament.currentLevel || 0);
    }
  }, [tournament]);

  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTournament = () => {
    if (tournament.levels.length === 0) {
      alert("No levels defined for the tournament");
      return;
    }
    
    const newStatus = 'running';
    const newLevel = 1;
    const newTimeRemaining = tournament.levels[0].duration * 60;
    
    setStatus(newStatus);
    setCurrentLevel(newLevel);
    setTimeRemaining(newTimeRemaining);
    
    onUpdate('status', newStatus);
    onUpdate('currentLevel', newLevel);
    onUpdate('timeRemaining', newTimeRemaining);
    
    startTimer();
  };

  const startTimer = () => {
    // Clear existing timer if any
    if (timer) {
      clearInterval(timer);
    }
    
    // Start a new timer
    const newTimer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          // Time's up, move to next level or break
          clearInterval(newTimer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  const handleTimeUp = () => {
    // Automatically move to next level or handle break
    if (status === 'break') {
      // End break, resume tournament
      const newStatus = 'running';
      setStatus(newStatus);
      onUpdate('status', newStatus);
      
      const newTimeRemaining = tournament.levels[currentLevel - 1].duration * 60;
      setTimeRemaining(newTimeRemaining);
      onUpdate('timeRemaining', newTimeRemaining);
      
      startTimer();
    } else {
      // Move to next level
      const nextLevel = currentLevel + 1;
      
      if (nextLevel > tournament.levels.length) {
        // Tournament is over
        setStatus('finished');
        onUpdate('status', 'finished');
        return;
      }
      
      setCurrentLevel(nextLevel);
      onUpdate('currentLevel', nextLevel);
      
      // Check if it's time for a break
      if (tournament.breakInterval > 0 && nextLevel % tournament.breakInterval === 0) {
        const newStatus = 'break';
        setStatus(newStatus);
        onUpdate('status', newStatus);
        
        const newTimeRemaining = tournament.breakDuration * 60;
        setTimeRemaining(newTimeRemaining);
        onUpdate('timeRemaining', newTimeRemaining);
      } else {
        const newTimeRemaining = tournament.levels[nextLevel - 1].duration * 60;
        setTimeRemaining(newTimeRemaining);
        onUpdate('timeRemaining', newTimeRemaining);
      }
      
      startTimer();
    }
  };

  const pauseClock = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    const newStatus = 'paused';
    setStatus(newStatus);
    onUpdate('status', newStatus);
  };

  const resumeClock = () => {
    const newStatus = status === 'break' ? 'break' : 'running';
    setStatus(newStatus);
    onUpdate('status', new
const BlindLevelSetup = ({ onSave }) => {
  const [levels, setLevels] = useState([
    { number: 1, smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 }
  ]);

  const addLevel = () => {
    const lastLevel = levels[levels.length - 1];
    const newLevel = {
      number: lastLevel.number + 1,
      smallBlind: lastLevel.smallBlind * 2,
      bigBlind: lastLevel.bigBlind * 2,
      ante: lastLevel.ante > 0 ? lastLevel.ante * 2 : 0,
      duration: lastLevel.duration
    };
    setLevels([...levels, newLevel]);
  };

  const updateLevel = (index, field, value) => {
    const updatedLevels = [...levels];
    updatedLevels[index][field] = parseInt(value, 10);
    setLevels(updatedLevels);
  };

  const removeLevel = (index) => {
    if (levels.length > 1) {
      const updatedLevels = [...levels];
      updatedLevels.splice(index, 1);
      // Renumber levels
      const renumbered = updatedLevels.map((level, idx) => ({
        ...level,
        number: idx + 1
      }));
      setLevels(renumbered);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(levels);
  };

  return (
    <div className="blind-level-setup">
      <h2>Blind Level Structure</h2>
      <form onSubmit={handleSubmit}>
        <div className="level-table">
          <div className="level-header">
            <div className="level-cell">Level</div>
            <div className="level-cell">Small Blind</div>
            <div className="level-cell">Big Blind</div>
            <div className="level-cell">Ante</div>
            <div className="level-cell">Duration (min)</div>
            <div className="level-cell">Actions</div>
          </div>
          
          {levels.map((level, index) => (
            <div className="level-row" key={`level-${index}`}>
              <div className="level-cell">{level.number}</div>
              
              <div className="level-cell">
                <input 
                  type="number" 
                  value={level.smallBlind} 
                  onChange={(e) => updateLevel(index, 'smallBlind', e.target.value)}
                  min="0"
                  required
                />
              </div>
              
              <div className="level-cell">
                <input 
                  type="number" 
                  value={level.bigBlind} 
                  onChange={(e) => updateLevel(index, 'bigBlind', e.target.value)}
                  min="0"
                  required
                />
              </div>
              
              <div className="level-cell">
                <input 
                  type="number" 
                  value={level.ante} 
                  onChange={(e) => updateLevel(index, 'ante', e.target.value)}
                  min="0"
                />
              </div>
              
              <div className="level-cell">
                <input 
                  type="number" 
                  value={level.duration} 
                  onChange={(e) => updateLevel(index, 'duration', e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              <div className="level-cell">
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => removeLevel(index)}
                  disabled={levels.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={addLevel}>
            Add Level
          </button>
          <button type="submit" className="btn btn-primary">
            Save Blind Structure
          </button>
        </div>
      </form>
    </div>
  );
};

// Player Management Component
const PlayerManagement = ({ tournament, onUpdate }) => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (tournament && tournament.players) {
      setPlayers(tournament.players);
    }
  }, [tournament]);

  const addPlayer = () => {
    if (newPlayerName.trim() === '') return;
    
    const newPlayer = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: newPlayerName.trim(),
      chips: tournament.startingChips,
      tableId: null,
      seatNumber: null,
      status: 'active',
      rebuys: 0,
      addons: 0
    };
    
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
    setNewPlayerName('');
  };

  const removePlayer = (playerId) => {
    const updatedPlayers = players.filter(player => player.id !== playerId);
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
  };

  const togglePlayerStatus = (playerId) => {
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          status: player.status === 'active' ? 'eliminated' : 'active',
          chips: player.status === 'active' ? 0 : player.chips
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
  };

  const addRebuy = (playerId) => {
    if (tournament.currentLevel > tournament.maxRebuyLevel) {
      alert("Rebuys are no longer allowed at this level");
      return;
    }
    
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          chips: player.chips + tournament.rebuyChips,
          rebuys: player.rebuys + 1
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
    onUpdate('totalRebuys', tournament.totalRebuys + 1);
  };

  const addAddon = (playerId) => {
    if (tournament.currentLevel > tournament.maxAddonLevel) {
      alert("Add-ons are no longer allowed at this level");
      return;
    }
    
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          chips: player.chips + tournament.addonChips,
          addons: player.addons + 1
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
    onUpdate('totalAddons', tournament.totalAddons + 1);
  };

  const updateChips = (playerId, newChips) => {
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          chips: parseInt(newChips, 10) || 0
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    onUpdate('players', updatedPlayers);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="player-management">
      <h2>Player Management</h2>
      
      <div className="add-player-form">
        <input
          type="text"
          placeholder="Enter player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <button onClick={addPlayer} className="btn btn-primary">Add Player</button>
      </div>
      
      <div className="player-controls">
        <button onClick={toggleEditMode} className="btn btn-secondary">
          {editMode ? "Done Editing" : "Edit Chips"}
        </button>
      </div>
      
      <div className="player-list">
        <div className="player-header">
          <div className="player-cell">Name</div>
          <div className="player-cell">Chips</div>
          <div className="player-cell">Table</div>
          <div className="player-cell">Seat</div>
          <div className="player-cell">Status</div>
          <div className="player-cell">Rebuys</div>
          <div className="player-cell">Add-ons</div>
          <div className="player-cell">Actions</div>
        </div>
        
        {players.map(player => (
          <div 
            className={`player-row ${player.status === 'eliminated' ? 'eliminated' : ''}`} 
            key={player.id}
          >
            <div className="player-cell">{player.name}</div>
            
            <div className="player-cell">
              {editMode ? (
                <input
                  type="number"
                  value={player.chips}
                  onChange={(e) => updateChips(player.id, e.target.value)}
                  min="0"
                />
              ) : (
                player.chips.toLocaleString()
              )}
            </div>
            
            <div className="player-cell">
              {player.tableId ? player.tableId : '-'}
            </div>
            
            <div className="player-cell">
              {player.seatNumber ? player.seatNumber : '-'}
            </div>
            
            <div className="player-cell">
              <span className={`status-badge ${player.status}`}>
                {player.status}
              </span>
            </div>
            
            <div className="player-cell">{player.rebuys}</div>
            
            <div className="player-cell">{player.addons}</div>
            
            <div className="player-cell player-actions">
              <button 
                onClick={() => togglePlayerStatus(player.id)} 
                className={`btn ${player.status === 'active' ? 'btn-danger' : 'btn-success'}`}
              >
                {player.status === 'active' ? 'Eliminate' : 'Reactivate'}
              </button>
              
              {player.status === 'active' && (
                <>
                  <button 
                    onClick={() => addRebuy(player.id)} 
                    className="btn btn-warning"
                    disabled={tournament.currentLevel > tournament.maxRebuyLevel}
                  >
                    Rebuy
                  </button>
                  
                  <button 
                    onClick={() => addAddon(player.id)} 
                    className="btn btn-info"
                    disabled={tournament.currentLevel > tournament.maxAddonLevel}
                  >
                    Add-on
                  </button>
                </>
              )}
              
              <button 
                onClick={() => removePlayer(player.id)} 
                className="btn btn-danger"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="player-summary">
        <p>Total Players: {players.length}</p>
        <p>Active Players: {players.filter(p => p.status === 'active').length}</p>
        <p>Total Rebuys: {players.reduce((total, player) => total + player.rebuys, 0)}</p>
        <p>Total Add-ons: {players.reduce((total, player) => total + player.addons, 0)}</p>
      </div>
    </div>
  );
