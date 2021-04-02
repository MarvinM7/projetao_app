import React, { Component } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import firebase from 'firebase';
import * as GoogleSignIn from 'expo-google-sign-in';

export class Cadastrar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nome: '',
            email: '',
            senha: '',
            mensagem: '',
            tipo: ''           
        }

        this.cadastrar = this.cadastrar.bind(this);
        this.cadastrarComGoogle = this.cadastrarComGoogle.bind(this);
    }

    cadastrar() {
        const { nome, email, senha} = this.state;
        firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((resposta) => {
            console.log(resposta)
        })
        .catch((resposta) => {
            console.log(resposta)
        })
    }

    async cadastrarComGoogle() {
        try {
            await GoogleSignIn.askForPlayServicesAsync();
            const { type, user } = await GoogleSignIn.signInAsync();
            this.setState({
                tipo: type
            })
            if (type === 'success') {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken);
                const googleProfileData = await firebase.auth().signInWithCredential(credential);
            }
            return {success: true};
        } catch ({ message }) {
            this.setState({
                mensagem: message
            })
            return {success: false, data: message};
        }
    }

    render() {
        return (
            <View>
                <TextInput 
                    placeholder="Nome"
                    onChangeText={(nome) => this.setState({ nome })}
                />
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
                    onPress={() => this.cadastrar()}
                    title="Cadastrar"
                />
                <Button
                    onPress={() => this.cadastrarComGoogle()}
                    title="Entrar com Google"
                />
                <Text>
                    {this.state.mensagem}
                </Text>
                <Text>
                    {this.state.tipo}
                </Text>
            </View>
        )
    }
}

export default Cadastrar;