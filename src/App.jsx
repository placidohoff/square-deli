import React from 'react';
import MenuGrid from './components/MenuGrid';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="container-fluid p-4">
      <header className="text-center mb-5">
        <h1 className="display-4 text-primary">Square Deli Menu</h1>
      </header>
      <main>
        <MenuGrid />
      </main>
    </div>
  );
}

export default App;
