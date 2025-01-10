import React, { useLayoutEffect, useState, useRef } from 'react';
import { MinusOutlined } from '@ant-design/icons';
import './index.less';

export default function DragBox(props) {
  const { draggable, setDraggable } = props;
  let recordXRef = useRef(0),
    recordYRef = useRef(0);
  let oriX, oriY, tarX, tarY;

  const mouseDown = e => {
    setDraggable(true);
  };
  const dragStart = e => {
    if (draggable) {
      e.dataTransfer.effectAllowed = 'move';
      oriX = e.nativeEvent.offsetX;
      oriY = e.nativeEvent.offsetY;
    }
  };

  const dragEnd = e => {
    if (draggable) {
      tarX = e.nativeEvent.offsetX;
      tarY = e.nativeEvent.offsetY;

      const moveX = tarX - oriX;
      const moveY = tarY - oriY;

      e.target.style.transform = `translate3d(${recordXRef.current + moveX}px,${
        recordYRef.current + moveY
      }px,0)`;
      recordXRef.current += moveX;
      recordYRef.current += moveY;
      localStorage.setItem(
        'pos',
        JSON.stringify({ top: top + recordYRef.current, left: left + recordXRef.current })
      );
      setDraggable(false);
    }
  };

  const [top, setTop] = useState(500);
  const [left, setLeft] = useState(1200);
  useLayoutEffect(() => {
    const pos = JSON.parse(localStorage.getItem('pos'));
    if (pos) {
      setTop(pos.top);
      setLeft(pos.left);
    } else {
      const container = document.getElementById('container');
      setTop((container.getBoundingClientRect().height / 4) * 3);
      setLeft((container.getBoundingClientRect().width / 6) * 5);
    }
  }, []);

  return (
    <div
      id="drag-box"
      draggable={draggable}
      onDragStart={dragStart}
      onDragEnd={dragEnd}
      style={{
        position: 'absolute',
        zIndex: 99,
        top,
        left,
      }}
    >
      <div
        className="hand"
        style={{ width: '100%', backgroundColor: 'grey', fontSize: '0px', textAlign: 'center' }}
        onMouseDown={mouseDown}
      >
        <MinusOutlined key="move" style={{ color: 'white', fontSize: '16px' }} />
      </div>
      {props.children}
    </div>
  );
}
