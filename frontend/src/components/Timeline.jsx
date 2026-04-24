import { useDroppable } from "@dnd-kit/core";
import SongCard from "./SongCard";


function Timeline(props) {
    const droppable = useDroppable({id: "timeline"})
    return <div>
        <h2>Timeline</h2>
        <div ref={droppable.setNodeRef} style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            {props.timeline.map(song => (
                <SongCard key={song.id} song={song} mode="timeline"/>
            ))}
        </div></div>
    
}

export default Timeline;