import React, { Component } from 'react';
import { Button, TextInput, View } from 'react-native';
import firebase from 'firebase';

export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            senha: ''            
        }

        this.logar = this.logar.bind(this);
    }

    logar() {
        const { email, senha} = this.state;
        firebase.auth().signInWithEmailAndPassword(email, senha)
        .then((resposta) => {
            console.log(resposta)
        })
        .catch((resposta) => {
            console.log(resposta)
        })
    }

    render() {
        return (
            <View>
                <TextInput 
                    placeholder="E-mail"
                    onChangeText={(email) => this.setState({ email })}
                />
                <TextInput 
                    placeholder="Senha"
                    onChangeText={(senha) => this.setState({ senha })}
                    secureTextEntry={true}
                />
                <Button
                    onPress={() => this.logar()}
                    title="Logar"
                />
            </View>
        )
    }
}

export default Login;