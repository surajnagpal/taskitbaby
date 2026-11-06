import { hydrate } from 'preact-iso';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { App } from './app';

// Pre-rendered pages are hydrated; anything else is rendered from scratch.
hydrate(<App />, document.getElementById('app')!);
