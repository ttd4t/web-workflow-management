/**
 * Write function convert string to slug
 */
import React, { useState, useEffect, useRef } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import {
   Container as BootstrapContainer,
   Row,
   Col,
   Form,
   Button,
} from 'react-bootstrap';
import { isEmpty } from 'lodash';

import './BoardContent.scss';
import Column from 'components/Column/Column';
import { mapOrder } from 'utilities/sorts';
import { applyDrag } from 'utilities/dragDrop';
import { fetchBoardDetails, createNewColumn } from 'actions/ApiCall';

function BoardContent() {
   // react hooks
   const [board, setBoard] = useState({});
   const [columns, setColumns] = useState([]);
   const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
   const toggleOpenNewColumnForm = () =>
      setOpenNewColumnForm(!openNewColumnForm);

   const newColumnInputRef = useRef(null);

   const [newColumnTitle, setNewColumnTitle] = useState('');

   useEffect(() => {
      const boardId = '63f74c073b43e235a2891487';
      fetchBoardDetails(boardId).then(board => {
         setBoard(board);

         // sort column
         setColumns(mapOrder(board.columns, board.columnOrder, '_id'));
      });
   }, []);

   useEffect(() => {
      if (newColumnInputRef && newColumnInputRef.current) {
         newColumnInputRef.current.focus();
         newColumnInputRef.current.select();
      }
   }, [openNewColumnForm]); // để khi biến giá trị openNewColumnForm thay đổi thì mới chạy useEffect

   if (isEmpty(board)) {
      return (
         <div className='not-found' style={{ padding: '10px', color: 'white' }}>
            Board not found!
         </div>
      );
   }

   const onColumnDrop = dropResult => {
      /* Creating a new array with the same values as the old array. */
      let newColumns = [...columns];
      newColumns = applyDrag(newColumns, dropResult);

      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map(c => c._id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);
   };

   const onCardDrop = (columnId, dropResult) => {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
         /* Creating a new array with the same values as the old array. */
         let newColumns = [...columns];

         let currentColumn = newColumns.find(c => c._id === columnId);
         currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
         currentColumn.cardOrder = currentColumn.cards.map(c => c._id);

         setColumns(newColumns);
      }
   };

   const addNewColumn = () => {
      if (!newColumnTitle) {
         newColumnInputRef.current.focus();
         return;
      }

      const newColumnToAdd = {
         title: newColumnTitle.trim(),
         boardId: board._id,
      };
      // Call API
      createNewColumn(newColumnToAdd).then(column => {
         let newColumns = [...columns];
         newColumns.push(column);

         let newBoard = { ...board };
         newBoard.columnOrder = newColumns.map(c => c._id);
         newBoard.columns = newColumns;

         setColumns(newColumns);
         setBoard(newBoard);
         setNewColumnTitle('');
         toggleOpenNewColumnForm();
      });
   };

   const onUpdateColumnState = newColumnToUpdate => {
      const columnIdToUpdate = newColumnToUpdate._id;

      let newColumns = [...columns];
      const columnIndexToUpdate = newColumns.findIndex(
         c => c._id === columnIdToUpdate
      );

      if (newColumnToUpdate._destroy) {
         // remove column
         newColumns.splice(columnIndexToUpdate, 1);
      } else {
         // update column info
         newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate);
      }

      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map(c => c._id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);
   };

   return (
      <div className='board-content'>
         <Container
            orientation='horizontal'
            /* A function that is called when a column is dropped. */
            onDrop={onColumnDrop}
            /* A function that returns the payload of the child at the given index. */
            getChildPayload={index => columns[index]}
            dragHandleSelector='.column-drag-handle'
            dropPlaceholder={{
               animationDuration: 150,
               showOnTop: true,
               className: 'column-drop-preview',
            }}>
            {columns.map((column, index) => (
               <Draggable key={index}>
                  <Column
                     column={column}
                     onCardDrop={onCardDrop}
                     onUpdateColumnState={onUpdateColumnState}
                  />
               </Draggable>
            ))}
         </Container>

         <BootstrapContainer className='add-column-container'>
            {!openNewColumnForm && (
               <Row>
                  <Col
                     className='add-new-column'
                     onClick={toggleOpenNewColumnForm}>
                     <i className='fa fa-plus icon' /> Add another column
                  </Col>
               </Row>
            )}
            {openNewColumnForm && (
               <Row>
                  <Col className='enter-new-column'>
                     <Form.Control
                        size='sm'
                        type='text'
                        placeholder='Enter column title...'
                        className='input-enter-new-column'
                        ref={newColumnInputRef}
                        value={newColumnTitle}
                        onChange={e => setNewColumnTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addNewColumn()}
                     />
                     <Button variant='success' size='sm' onClick={addNewColumn}>
                        Add column
                     </Button>
                     <span
                        className='cancel-icon'
                        onClick={toggleOpenNewColumnForm}>
                        <i className='fa fa-times icon' />
                     </span>
                  </Col>
               </Row>
            )}
         </BootstrapContainer>
         {/* <div className='add-new-column'>
            <i className='fa fa-plus icon' /> Add another column
         </div> */}
      </div>
   );
}

export default BoardContent;
