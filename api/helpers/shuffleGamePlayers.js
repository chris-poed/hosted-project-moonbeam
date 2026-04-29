
 //standard Fisher-Yates algorithm for shuffling an array
function shuffleGamePlayers(playersArray){
            for(let i = playersArray.length -1; i>0; i--){
                const j = Math.floor(Math.random()*(i+1));
                [playersArray[i], playersArray[j]] = [playersArray[j], playersArray[i]]
            }
            return playersArray
        }

module.exports = shuffleGamePlayers;