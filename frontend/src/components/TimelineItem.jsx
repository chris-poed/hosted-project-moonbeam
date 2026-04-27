import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function TimelineItem(props) {
    const sortable = useSortable({id: props.song.id})
    const style = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition
    }


  return <div 
    ref={sortable.setNodeRef} 
    {...sortable.listeners} 
    {...sortable.attributes} 
    style={ style }
        >
    {props.song.year}
    </div> 
 
}

export default TimelineItem