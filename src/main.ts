import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './style.css';
import { App } from './ui/app';

const root = document.getElementById('app');
if (root) void new App(root).run();
