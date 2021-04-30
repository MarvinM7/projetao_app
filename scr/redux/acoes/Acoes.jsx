import { USER_STATE_CHANGE } from '../constantes/Constantes';
import firebase from 'firebase/app';
import 'firebase/firestore';

export function buscarUsuario() {
    return((dispatch) => {
        firebase.firestore()
            .collection('usuarios')
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
                if (snapshot.exists) {
                    dispatch({
                        type: USER_STATE_CHANGE,
                        usuarioAtual: snapshot.data()
                    })
                }
            })
            .catch((resposta) => {
                console.log(resposta);
            })
    })
}

export function logOut() {
    return((dispatch) => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                dispatch({
                    type: USER_STATE_CHANGE,
                    usuarioAtual: null
                })
            })
            .catch((erro) => {
                console.log('Erro ao deslogar: ' + erro);
            })
    })
}