import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function CardBankItem(props) {
  const draggable = useDraggable({
    id: props.song.id,
  });

  const style = {
    position: "absolute",
    top: `${props.index * 2}px`,
    left: `${props.index * 2}px`,
    width: "50px",
    height: "60px",
    border: "1px solid black",
    background: "white",
    transform: CSS.Transform.toString(draggable.transform),
    opacity: props.isDragging ? 0 : 1,
    zIndex: props.isTopCard ? 100 : props.index,
    cursor: props.isTopCard ? "grab" : "default",
    pointerEvents: props.isTopCard ? "auto" : "none",

    fontSize: "32px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      ref={draggable.setNodeRef}
      {...(props.isTopCard ? draggable.listeners : {})}
      {...(props.isTopCard ? draggable.attributes : {})}
      style={style}
    >
      {props.isTopCard ? "?" : ""}
    </div>
  );
}

export default CardBankItem;
