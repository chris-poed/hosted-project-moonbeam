import SongCard from "./SongCard"

function CardBank(props) {
  return <div>
           <h2>Card Bank</h2>
           <div>
            {props.cardBank.map(song => (
                <SongCard key={song.id} song={song} mode="bank"/>
            ))}
           </div>
          </div>
}

export default CardBank