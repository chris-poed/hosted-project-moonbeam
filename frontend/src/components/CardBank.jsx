import CardBankItem from "./CardBankItem";

function CardBank(props) {
  return (
    <div>
      <h2>Card Bank</h2>

      <div
        style={{
          position: "relative",
          width: "60px",
          height: "80px",
        }}
      >
        {props.cardBank.map((song, index) => (
          <CardBankItem
            key={song.id}
            song={song}
            index={index}
            isTopCard={index === 0}
            isDragging={props.activeCard?.id === song.id}
          />
        ))}
      </div>
    </div>
  );
}

export default CardBank;