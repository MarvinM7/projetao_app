import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LandingScreen({ navigation}) {
    return (
        <View style={styles.container}>
            <Button
                title="Cadastrar"
                onPress={() => navigation.navigate('Cadastrar')}
            />
            <Button
                title="Login"
                onPress={() => navigation.navigate('Login')}
            />
        </View>
    )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	}
});