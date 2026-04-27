import CardBankItem from "./CardBankItem"

function CardBank(props) {
  return <div>
           <h2>Card Bank</h2>
           <div>
            {props.cardBank.map(song => (
                <CardBankItem key={song.id} song={song}/>
            ))}
           </div>
          </div>
}

export default CardBank

