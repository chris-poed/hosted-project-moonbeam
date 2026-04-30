import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TimelineItem(props) {
  const sortable = useSortable({ id: props.song.id }); // useStoppable makes each card droppable + reorderable

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    padding: "10px",
    // border: "1px solid black",
    borderRadius: "4px",
    // background: "white",
    color: "black", // add this
    
    background: "linear-gradient(135deg, rgba(232, 67, 147, 0.95), rgba(192, 132, 252, 0.95))",
    border: "1px solid rgba(255, 255, 255, 0.28)",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.45), 0 0 30px rgba(232, 67, 147, 0.35)",
    // color: "#fff",

    cursor: props.isDraggable ? "grab" : "default",

    // Hide original card while DragOverlay is moving
    opacity: sortable.isDragging ? 0 : 1,

    minWidth: "60px",
    textAlign: "center",
    fontWeight: "bold",
    boxSizing: "border-box",
  };

  return (
    <div
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...(props.isDraggable ? sortable.listeners : {})}
      style={style}
    >
      {props.isDraggable ? (
  <span style={{ fontSize: "32px", fontWeight: "bold" }}>?</span>
) : (
  props.song.year
)}
    </div>
  );
}

export default TimelineItem;
