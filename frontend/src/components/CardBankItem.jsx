import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

function CardBankItem(props) {
    const draggable = useDraggable({id: props.song.id})
    const style = {
        transform: CSS.Transform.toString(draggable.transform)
    }


  return <div 
    ref={draggable.setNodeRef} 
    {...draggable.listeners} 
    {...draggable.attributes} 
    style={ style }
        >
    {props.song.title}, {props.song.artist}, {props.song.year}
    </div> 
 
}

export default CardBankItem