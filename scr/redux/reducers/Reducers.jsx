import { combineReducers } from 'redux';
import { Usuario } from './Usuario';

const Reducers = combineReducers({
    usuarioState: Usuario
})

export default Reducers;