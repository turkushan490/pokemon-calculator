# AI Learning System - Pokemon Battle Simulator

## Overview

The AI Learning System uses battle data to predict the best moves in different situations. It learns from every battle and improves over time.

## How It Works

### 1. **Battle Logging**
Every battle is recorded in detail:
- Turn-by-turn actions
- Moves used and their effects
- Damage dealt and effectiveness
- Critical hits and KOs
- Pokemon that fainted first

### 2. **Move Effectiveness Tracking**
The system tracks how effective each move is:
- **Total Uses**: How many times a move was used
- **Success Rate**: How often the move succeeded
- **Average Damage**: Typical damage dealt
- **KO Count**: How many KOs this move achieved
- **Effectiveness Rating**: Overall rating based on performance

### 3. **AI Predictions**
The AI creates predictions for battle situations:
- **Situation Hash**: Unique ID for each battle situation
- **Recommended Move**: Best move based on past data
- **Confidence Score**: How confident the AI is (0-1)
- **Win Rate**: Success rate when this recommendation was followed

### 4. **Learning Process**

```
Battle Occurs
    ↓
Log Every Action
    ↓
Update Move Effectiveness
    ↓
Create/Update Predictions
    ↓
AI Gets Smarter!
```

## Database Tables

### `battle_logs`
Stores turn-by-turn battle actions:
- Turn number
- Action type (move, switch, faint, etc.)
- Pokemon involved
- Move used and damage
- Effectiveness multiplier
- Critical hits

### `move_effectiveness`
Tracks move performance:
- Attacker/Defender Pokemon
- Move name
- Usage statistics
- Damage statistics
- Effectiveness rating

### `ai_predictions`
Stores AI recommendations:
- Battle situation
- Recommended move
- Confidence level
- Success rate

## Features

### ✅ Currently Implemented
- Database schema for AI learning
- Battle logging structure
- Move effectiveness tracking tables
- AI predictions table
- Battle log viewer component

### 🚧 In Progress
- Enhanced battle simulation with detailed logs
- Move effectiveness calculation
- AI prediction generation
- Battle replay system

### 📋 Planned Features
- **Real-time AI Suggestions**: Show suggested moves during battles
- **Move Heatmaps**: Visual representations of move effectiveness
- **Team Synergy Analysis**: AI analyzes team composition
- **Meta Analysis**: Track which Pokemon/moves are most effective
- **Export/Import AI Data**: Share learning data between users
- **AI vs AI Battles**: Watch AIs battle each other
- **Training Mode**: Dedicated mode for training the AI

## Usage

### Viewing Battle Logs
1. Go to **Results** page
2. Find a battle in the history
3. Click **"View Log"** to see detailed turn-by-turn actions
4. See moves used, damage dealt, effectiveness, and more

### Checking Move Effectiveness
1. The AI automatically tracks every move
2. Data accumulates over time
3. More battles = better predictions

### AI Predictions (Coming Soon)
1. During a battle, the AI will suggest moves
2. Suggestions are based on similar past situations
3. Confidence scores show how reliable the suggestion is

## Example: How AI Learns

**Battle 1:**
- Pikachu uses Thunderbolt on Charizard
- Deals 80 damage (super effective!)
- Charizard faints
- AI records: "Thunderbolt vs Charizard = Very Effective"

**Battle 2:**
- Pikachu uses Thunderbolt on Charizard again
- Deals 75 damage
- Charizard faints
- AI updates: "Average damage = 77.5 HP"

**Battle 10:**
- AI sees Pikachu vs Charizard
- **Recommendation**: Use Thunderbolt (95% confidence)
- **Reason**: 100% KO rate in past battles

## Technical Implementation

### Move Effectiveness Formula
```
Effectiveness Rating = (
  (KO Rate × 3) +
  (Damage Per Turn × 2) +
  (Success Rate × 1.5) +
  (Type Effectiveness × 2)
) / Total Uses
```

### Situation Hash
```
hash = `${myPokemon}_${opponentPokemon}_${myHP%}_${oppHP%}`
Example: "pikachu_charizard_100_50"
```

### Confidence Score
```
confidence = min(1.0, (successful_outcomes / times_used) × (times_used / 10))
```
More data = more confidence!

## Future Enhancements

1. **Neural Network Integration**: Use actual machine learning
2. **Monte Carlo Tree Search**: Advanced move prediction
3. **Genetic Algorithm Teams**: Evolve optimal teams
4. **Reinforcement Learning**: Self-playing AI
5. **Team Builder AI**: Auto-suggest team compositions
6. **Showdown Integration**: Learn from real competitive battles

## Contributing

To improve the AI:
1. Run more simulations (more data!)
2. Report unusual predictions
3. Suggest new features
4. Help implement advanced algorithms

---

**Note**: The AI system is in active development. Current implementation includes the database structure and logging framework. Full AI predictions will be added in future updates!
