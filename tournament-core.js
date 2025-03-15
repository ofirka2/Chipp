// Tournament Management App Structure

// 1. Main Components
// - TournamentSetup: Initial configuration
// - PlayerManagement: Add/edit/remove players 
// - TableAssignment: Assign players to tables/seats
// - TournamentClock: Timer and level management
// - ChipTracker: Track player chips and tournament statistics
// - PrizeCalculator: Calculate prize distribution

// 2. Data Models

class Player {
  constructor(name, startingChips = 0, tableId = null, seatNumber = null) {
    this.id = Date.now() + Math.floor(Math.random() * 1000); // Simple unique ID
    this.name = name;
    this.chips = startingChips;
    this.tableId = tableId;
    this.seatNumber = seatNumber;
    this.status = 'active'; // active, eliminated
    this.rebuys = 0;
    this.addons = 0;
  }
  
  rebuy(amount) {
    this.chips += amount;
    this.rebuys++;
    return this;
  }
  
  addon(amount) {
    this.chips += amount;
    this.addons++;
    return this;
  }
  
  eliminate() {
    this.status = 'eliminated';
    this.chips = 0;
    return this;
  }
}

class Table {
  constructor(id, maxSeats = 9) {
    this.id = id;
    this.maxSeats = maxSeats;
    this.seats = Array(maxSeats).fill(null); // Array of player IDs or null
  }
  
  assignSeat(playerId, seatNumber) {
    if (seatNumber < 1 || seatNumber > this.maxSeats) {
      throw new Error(`Invalid seat number. Must be between 1 and ${this.maxSeats}`);
    }
    
    // Check if seat is already taken
    if (this.seats[seatNumber - 1] !== null) {
      throw new Error(`Seat ${seatNumber} is already occupied`);
    }
    
    this.seats[seatNumber - 1] = playerId;
    return this;
  }
  
  removeSeat(seatNumber) {
    if (seatNumber < 1 || seatNumber > this.maxSeats) {
      throw new Error(`Invalid seat number. Must be between 1 and ${this.maxSeats}`);
    }
    
    this.seats[seatNumber - 1] = null;
    return this;
  }
  
  getAvailableSeats() {
    return this.seats
      .map((playerId, index) => playerId === null ? index + 1 : null)
      .filter(seat => seat !== null);
  }
  
  isFull() {
    return !this.seats.includes(null);
  }
  
  isEmpty() {
    return this.seats.every(seat => seat === null);
  }
  
  getPlayerCount() {
    return this.seats.filter(seat => seat !== null).length;
  }
}

class TournamentLevel {
  constructor(number, smallBlind, bigBlind, ante = 0, duration = 20) {
    this.number = number;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.ante = ante;
    this.duration = duration; // in minutes
  }
}

class Tournament {
  constructor(name) {
    this.name = name;
    this.players = [];
    this.tables = [];
    this.levels = [];
    this.currentLevel = 0;
    this.timeRemaining = 0; // in seconds
    this.status = 'setup'; // setup, running, break, finished
    
    // Configuration
    this.buyInAmount = 0;
    this.startingChips = 0;
    this.rebuyAmount = 0;
    this.rebuyChips = 0;
    this.maxRebuyLevel = 0;
    this.addonAmount = 0;
    this.addonChips = 0;
    this.maxAddonLevel = 0;
    this.breakInterval = 0; // how many levels between breaks
    this.breakDuration = 0; // in minutes
    
    // Statistics
    this.totalBuyIns = 0;
    this.totalRebuys = 0;
    this.totalAddons = 0;
    this.totalPrizePool = 0;
  }
  
  // Setup methods
  configure({
    buyInAmount,
    startingChips,
    rebuyAmount,
    rebuyChips,
    maxRebuyLevel,
    addonAmount,
    addonChips,
    maxAddonLevel,
    breakInterval,
    breakDuration
  }) {
    this.buyInAmount = buyInAmount;
    this.startingChips = startingChips;
    this.rebuyAmount = rebuyAmount;
    this.rebuyChips = rebuyChips;
    this.maxRebuyLevel = maxRebuyLevel;
    this.addonAmount = addonAmount;
    this.addonChips = addonChips;
    this.maxAddonLevel = maxAddonLevel;
    this.breakInterval = breakInterval;
    this.breakDuration = breakDuration;
    return this;
  }
  
  addLevel(smallBlind, bigBlind, ante = 0, duration = 20) {
    const levelNumber = this.levels.length + 1;
    const level = new TournamentLevel(levelNumber, smallBlind, bigBlind, ante, duration);
    this.levels.push(level);
    return this;
  }
  
  // Player management
  addPlayer(name) {
    const player = new Player(name, this.startingChips);
    this.players.push(player);
    this.totalBuyIns++;
    this.updatePrizePool();
    return player;
  }
  
  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;
    
    const player = this.players[playerIndex];
    
    // Remove player from table if assigned
    if (player.tableId !== null && player.seatNumber !== null) {
      const table = this.tables.find(t => t.id === player.tableId);
      if (table) {
        table.removeSeat(player.seatNumber);
      }
    }
    
    // Remove player from array
    this.players.splice(playerIndex, 1);
    return true;
  }
  
  eliminatePlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;
    
    player.eliminate();
    return true;
  }
  
  rebuyPlayer(playerId) {
    if (this.currentLevel > this.maxRebuyLevel) {
      throw new Error("Rebuys are no longer allowed at this level");
    }
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;
    
    player.rebuy(this.rebuyChips);
    this.totalRebuys++;
    this.updatePrizePool();
    return true;
  }
  
  addonPlayer(playerId) {
    if (this.currentLevel > this.maxAddonLevel) {
      throw new Error("Add-ons are no longer allowed at this level");
    }
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;
    
    player.addon(this.addonChips);
    this.totalAddons++;
    this.updatePrizePool();
    return true;
  }
  
  // Table management
  createTable(tableId) {
    const table = new Table(tableId);
    this.tables.push(table);
    return table;
  }
  
  assignPlayerToTable(playerId, tableId, seatNumber = null) {
    const player = this.players.find(p => p.id === playerId);
    const table = this.tables.find(t => t.id === tableId);
    
    if (!player || !table) {
      throw new Error("Player or table not found");
    }
    
    // Remove player from current table if assigned
    if (player.tableId !== null && player.seatNumber !== null) {
      const currentTable = this.tables.find(t => t.id === player.tableId);
      if (currentTable) {
        currentTable.removeSeat(player.seatNumber);
      }
    }
    
    // If seat number is not specified, find the first available seat
    if (seatNumber === null) {
      const availableSeats = table.getAvailableSeats();
      if (availableSeats.length === 0) {
        throw new Error("No available seats at this table");
      }
      seatNumber = availableSeats[0];
    }
    
    // Assign player to new table and seat
    table.assignSeat(playerId, seatNumber);
    player.tableId = tableId;
    player.seatNumber = seatNumber;
    
    return true;
  }
  
  // Random seat assignment
  randomlyAssignPlayers() {
    // Get active players
    const activePlayers = this.players.filter(p => p.status === 'active');
    
    // Calculate how many tables we need
    const totalPlayers = activePlayers.length;
    const maxPlayersPerTable = 9;
    const numTables = Math.ceil(totalPlayers / maxPlayersPerTable);
    
    // Create tables if needed
    while (this.tables.length < numTables) {
      this.createTable(`Table ${this.tables.length + 1}`);
    }
    
    // Shuffle players
    const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5);
    
    // Clear all table assignments
    this.tables.forEach(table => {
      table.seats = Array(table.maxSeats).fill(null);
    });
    
    shuffledPlayers.forEach(player => {
      player.tableId = null;
      player.seatNumber = null;
    });
    
    // Assign players to tables evenly
    let tableIndex = 0;
    
    shuffledPlayers.forEach((player, index) => {
      // Distribute players evenly across tables
      tableIndex = index % numTables;
      const table = this.tables[tableIndex];
      
      // Find random available seat
      const availableSeats = table.getAvailableSeats();
      const randomSeatIndex = Math.floor(Math.random() * availableSeats.length);
      const seatNumber = availableSeats[randomSeatIndex];
      
      // Assign player to seat
      this.assignPlayerToTable(player.id, table.id, seatNumber);
    });
    
    return true;
  }
  
  // Tournament clock
  startTournament() {
    if (this.levels.length === 0) {
      throw new Error("No levels defined for the tournament");
    }
    
    this.currentLevel = 1;
    this.timeRemaining = this.levels[0].duration * 60; // Convert to seconds
    this.status = 'running';
    return this;
  }
  
  pauseClock() {
    if (this.status === 'running') {
      this.status = 'paused';
    }
    return this;
  }
  
  resumeClock() {
    if (this.status === 'paused') {
      this.status = 'running';
    }
    return this;
  }
  
  nextLevel() {
    if (this.currentLevel >= this.levels.length) {
      throw new Error("No more levels defined");
    }
    
    this.currentLevel++;
    
    // Check if it's time for a break
    if (this.breakInterval > 0 && this.currentLevel % this.breakInterval === 0) {
      this.status = 'break';
      this.timeRemaining = this.breakDuration * 60; // Convert to seconds
    } else {
      this.status = 'running';
      this.timeRemaining = this.levels[this.currentLevel - 1].duration * 60; // Convert to seconds
    }
    
    return this;
  }
  
  // Prize pool and statistics
  updatePrizePool() {
    this.totalPrizePool = 
      (this.totalBuyIns * this.buyInAmount) +
      (this.totalRebuys * this.rebuyAmount) +
      (this.totalAddons * this.addonAmount);
    return this.totalPrizePool;
  }
  
  calculatePrizes() {
    const prizePool = this.totalPrizePool;
    const activePlayers = this.players.length;
    const payoutSpots = Math.ceil(activePlayers * 0.4); // 40% of players get paid
    
    if (payoutSpots === 0) return [];
    
    // Simple prize distribution algorithm
    // This can be customized based on preference
    const prizes = [];
    
    if (payoutSpots === 1) {
      // Winner takes all
      prizes.push({ position: 1, amount: prizePool });
    } else if (payoutSpots === 2) {
      // 1st: 65%, 2nd: 35%
      prizes.push({ position: 1, amount: prizePool * 0.65 });
      prizes.push({ position: 2, amount: prizePool * 0.35 });
    } else if (payoutSpots === 3) {
      // 1st: 50%, 2nd: 30%, 3rd: 20%
      prizes.push({ position: 1, amount: prizePool * 0.5 });
      prizes.push({ position: 2, amount: prizePool * 0.3 });
      prizes.push({ position: 3, amount: prizePool * 0.2 });
    } else {
      // More than 3 players paid
      const firstPlacePercent = 0.35;
      const remainingPool = prizePool * (1 - firstPlacePercent);
      
      prizes.push({ position: 1, amount: prizePool * firstPlacePercent });
      
      // Distribute remaining amount with diminishing returns
      for (let i = 2; i <= payoutSpots; i++) {
        const portion = 1 / (i * Math.log(payoutSpots));
        const normalizedPortion = portion / payoutSpots;
        prizes.push({ position: i, amount: remainingPool * normalizedPortion * 2 });
      }
      
      // Normalize to ensure we distribute 100% of prize pool
      const totalDistributed = prizes.reduce((sum, prize) => sum + prize.amount, 0);
      const adjustmentFactor = prizePool / totalDistributed;
      
      prizes.forEach(prize => {
        prize.amount = Math.floor(prize.amount * adjustmentFactor);
      });
      
      // Add any remaining cents to first place due to rounding
      const totalAfterAdjustment = prizes.reduce((sum, prize) => sum + prize.amount, 0);
      const remainder = prizePool - totalAfterAdjustment;
      prizes[0].amount += remainder;
    }
    
    return prizes;
  }
  
  getTournamentStats() {
    const activePlayers = this.players.filter(p => p.status === 'active').length;
    const totalChips = this.players.reduce((sum, player) => sum + player.chips, 0);
    const averageStack = activePlayers > 0 ? totalChips / activePlayers : 0;
    
    return {
      totalPlayers: this.players.length,
      activePlayers,
      eliminatedPlayers: this.players.length - activePlayers,
      totalBuyIns: this.totalBuyIns,
      totalRebuys: this.totalRebuys,
      totalAddons: this.totalAddons,
      totalPrizePool: this.totalPrizePool,
      totalChips,
      averageStack,
      currentLevel: this.currentLevel,
      currentBlindLevel: this.currentLevel > 0 ? 
        `${this.levels[this.currentLevel - 1].smallBlind}/${this.levels[this.currentLevel - 1].bigBlind}` : 'N/A',
      timeRemaining: this.timeRemaining,
      status: this.status
    };
  }
}

// 3. Example Usage

// Initialize a new tournament
const pokerTournament = new Tournament("Saturday Night Special");

// Configure tournament settings
pokerTournament.configure({
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

// Define blind levels
pokerTournament.addLevel(25, 50, 0, 20); // Level 1: 25/50 blinds, no ante, 20 minutes
pokerTournament.addLevel(50, 100, 0, 20); // Level 2
pokerTournament.addLevel(75, 150, 0, 20); // Level 3
pokerTournament.addLevel(100, 200, 25, 20); // Level 4: added 25 ante
pokerTournament.addLevel(150, 300, 25, 20); // Level 5
pokerTournament.addLevel(200, 400, 50, 20); // Level 6
pokerTournament.addLevel(300, 600, 75, 20); // Level 7
pokerTournament.addLevel(400, 800, 100, 20); // Level 8
pokerTournament.addLevel(500, 1000, 100, 20); // Level 9
pokerTournament.addLevel(600, 1200, 200, 20); // Level 10
pokerTournament.addLevel(800, 1600, 200, 15); // Level 11: shorter duration
pokerTournament.addLevel(1000, 2000, 300, 15); // Level 12
pokerTournament.addLevel(1500, 3000, 400, 15); // Level 13
pokerTournament.addLevel(2000, 4000, 500, 15); // Level 14
pokerTournament.addLevel(3000, 6000, 1000, 15); // Level 15
pokerTournament.addLevel(4000, 8000, 1000, 15); // Level 16
pokerTournament.addLevel(5000, 10000, 2000, 15); // Level 17
pokerTournament.addLevel(10000, 20000, 3000, 15); // Level 18

// Add players
pokerTournament.addPlayer("John Doe");
pokerTournament.addPlayer("Jane Smith");
pokerTournament.addPlayer("Bob Johnson");
pokerTournament.addPlayer("Alice Williams");
pokerTournament.addPlayer("Charlie Brown");
pokerTournament.addPlayer("David Miller");
pokerTournament.addPlayer("Eva Davis");
pokerTournament.addPlayer("Frank Wilson");
pokerTournament.addPlayer("Grace Moore");
pokerTournament.addPlayer("Henry Taylor");

// Create tables
pokerTournament.createTable("Table 1");
pokerTournament.createTable("Table 2");

// Randomly assign players to tables
pokerTournament.randomlyAssignPlayers();

// Start the tournament
pokerTournament.startTournament();

// Get tournament stats
console.log(pokerTournament.getTournamentStats());

// Calculate prizes
console.log(pokerTournament.calculatePrizes());

// Example of player elimination
pokerTournament.eliminatePlayer(pokerTournament.players[9].id);

// Example of rebuy
pokerTournament.rebuyPlayer(pokerTournament.players[0].id);

// Example of addon
pokerTournament.addonPlayer(pokerTournament.players[1].id);

// Move to next level
pokerTournament.nextLevel();

// Get updated stats
console.log(pokerTournament.getTournamentStats());
