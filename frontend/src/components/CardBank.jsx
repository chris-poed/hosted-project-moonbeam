import CardBankItem from "./CardBankItem";

// cardBank and activeCard are now also given default values
function CardBank({ cardBank = [], activeCard = null }) {
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
            {cardBank.map(( song, index, // Take every song in the card bank and turn it into a CardBankItem component
            ) => (
                <CardBankItem
                key={song.id}
                song={song}
                index={index}
                isTopCard={index === 0} // is this the first card in the array as only the top card should be draggable
                isDragging={activeCard?.id === song.id} // Checks to see if song.id is the specific card that is currently being dragged
                />                                              // The ?. is called optional chaining.  It prevents errors such as activeCard = null
            ),                                                // This can happen if nothing is being dragged - and without ?. React would crash
            )}
        </div>
        </div>
    );
}

export default CardBank;
