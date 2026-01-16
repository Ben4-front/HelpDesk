import './css/style.css';
import HelpDesk from './js/app';

const root = document.getElementById('root');
const app = new HelpDesk(root);

app.init();