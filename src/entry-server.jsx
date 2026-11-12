import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export function render(route = '/') {
  return renderToString(<App initialRoute={route} />);
}
