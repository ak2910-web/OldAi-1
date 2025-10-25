
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import Splash from './src/Screen/Splash'
import Homescreen from './src/Screen/Homescreen'
import Textinput from './src/Screen/Textinput'
import Imageinput from './src/Screen/Imageinput'
import Login from './src/Screen/Login'
import Signup from './src/Screen/Signup'
import Profile from './src/Screen/Profile'

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer >
      <Stack.Navigator screenOptions={{
        headerShown: false, // 👈 hides header for all screens
      }}
      initialRouteName="splash">
  <Stack.Screen name='splash' component={Splash} />
  <Stack.Screen name='Login' component={Login} />
  <Stack.Screen name='Signup' component={Signup} />
  <Stack.Screen name='Profile' component={Profile} />
  <Stack.Screen name='Home' component={Homescreen} />
  <Stack.Screen name='Textinput' component={Textinput} />
  <Stack.Screen name= 'Imageinput' component={Imageinput} />



      </Stack.Navigator>

    </NavigationContainer>
  )
}


export default App