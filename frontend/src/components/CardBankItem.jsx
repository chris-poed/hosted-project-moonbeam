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
    height: "70px",
    // border: "1px solid black",
    background: "linear-gradient(135deg, rgba(232, 67, 147, 0.95), rgba(192, 132, 252, 0.95))",
    border: "1px solid rgba(255, 255, 255, 0.28)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.45), 0 0 30px rgba(232, 67, 147, 0.35)",
    // color: "#fff",
    color: "black",
    borderRadius: "4px",
    // background: "white",
    transform: CSS.Transform.toString(draggable.transform),
    opacity: props.isDragging ? 0 : 1, // the original card disappears while dragging.
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
