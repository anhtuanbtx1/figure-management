"use client";
import { useContext } from "react";
import KanbanHeader from "./KanbanHeader";
import { KanbanDataContext } from "@/app/context/kanbancontext/index";
import CategoryTaskList from "./CategoryTaskList";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import SimpleBar from "simplebar-react";
import { Box } from "@mui/material";

function TaskManager() {
  const { todoCategories, moveTask } = useContext(KanbanDataContext);
  const onDragEnd = (result: { source: any; destination: any; draggableId: any; }) => {
    const { source, destination, draggableId } = result;

    // If no destination is provided or the drop is in the same place, do nothing
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    // Extract necessary information from the result
    const sourceCategoryId = source.droppableId;
    const destinationCategoryId = destination.droppableId;
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Call moveTask function from context
    moveTask(draggableId, sourceCategoryId, destinationCategoryId, sourceIndex, destinationIndex);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <KanbanHeader />
      <Box sx={{ flex: 1, overflow: 'hidden', p: { xs: 1, sm: 2, md: 3 } }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            display="flex"
            gap={{ xs: 1, sm: 1.5, md: 2 }}
            sx={{
              minHeight: '600px',
              pb: 2,
              width: '100%',
              overflow: { xs: 'auto', lg: 'visible' },
              // Responsive grid-like behavior
              '& > *': {
                flex: {
                  xs: '0 0 280px',  // Mobile: fixed width with scroll
                  sm: '0 0 calc(50% - 8px)',  // Tablet: 2 columns
                  md: '0 0 calc(33.333% - 12px)',  // Medium: 3 columns
                  lg: '1 1 0',  // Desktop: equal distribution
                },
                minWidth: { xs: 280, lg: 250 },
                maxWidth: { xs: 320, lg: 'none' },
              },
            }}
          >
            {todoCategories.map((category) => (
              <Droppable droppableId={category.id.toString()} key={category.id}>
                {(provided: any, snapshot: any) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: snapshot.isDraggingOver ? 'scale(1.02)' : 'scale(1)',
                      filter: snapshot.isDraggingOver ? 'brightness(1.05)' : 'brightness(1)',
                    }}
                  >
                    <CategoryTaskList id={category.id} />
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      </Box>
    </Box>
  );
}

export default TaskManager;




