import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Home({ navigation }) {
	return (
		<View style={styles.container}>
			<StatusBar style="auto" />
			<Text>
				Home
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFF',
		alignItems: 'center',
		justifyContent: 'center',
	},

	button: {
		width: '80%',
		backgroundColor: 'blue',
		alignItems: 'center',
		justifyContent: 'center',
	}
});