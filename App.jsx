
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import Splash from './src/Screen/Splash'
import Homescreen from './src/Screen/Homescreen'
import Textinput from './src/Screen/Textinput'
import Imageinput from './src/Screen/Imageinput'

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer >
      <Stack.Navigator screenOptions={{
        headerShown: false, // 👈 hides header for all screens
      }}>
        <Stack.Screen name='splash' component={Splash} />
        <Stack.Screen name='Home' component={Homescreen} />
        <Stack.Screen name='Textinput' component={Textinput} />
        <Stack.Screen name= 'Imageinput' component={Imageinput} />



      </Stack.Navigator>

    </NavigationContainer>
  )
}


export default App