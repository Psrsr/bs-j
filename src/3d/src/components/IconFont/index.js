import React from 'react';

export default function IconFont(props) {
  const { tag } = props;

  return (
    <span role="img">
      <svg className="icon" aria-hidden="true">
        <use xlinkHref={`#icon-${tag}`}></use>
      </svg>
    </span>
  );
}
