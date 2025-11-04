
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import Splash from './src/Screen/Splash'
import ArrowLeftIcon from './src/components/ArrowLeftIcon'
import Homescreen from './src/Screen/Homescreen'
import Textinput from './src/Screen/Textinput'
import Imageinput from './src/Screen/Imageinput'
import Login from './src/Screen/Login'
import Signup from './src/Screen/Signup'
import Profile from './src/Screen/Profile'
import ForgotPassword from './src/Screen/ForgotPassword'
import ProfileEdit from './src/Screen/ProfileEdit'
import Output from './src/Screen/Output'
import HowItWorks from './src/Screen/HowItWorks'
import About from './src/Screen/About'

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer >
      <Stack.Navigator screenOptions={{
        // show the native header for all screens so a back button is available
        headerShown: true,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerBackVisible: true,
        // Use our app icon as the back image (works with native-stack)
        headerBackImage: () => <ArrowLeftIcon size={22} color="#111" style={{ marginLeft: 8 }} />,
      }}
      initialRouteName="splash">
  <Stack.Screen name='splash' component={Splash} options={{ headerShown: false }} />
  <Stack.Screen name='Login' component={Login} />
  <Stack.Screen name='Signup' component={Signup} />
  <Stack.Screen name='Profile' component={Profile} />
  <Stack.Screen name='ProfileEdit' component={ProfileEdit} />
  <Stack.Screen name='Home' component={Homescreen} />
  <Stack.Screen name='HowItWorks' component={HowItWorks} options={{ title: 'How it works' }} />
  <Stack.Screen name='About' component={About} options={{ title: 'About VedAI' }} />
  <Stack.Screen name='Textinput' component={Textinput} />
  <Stack.Screen name= 'Imageinput' component={Imageinput} />
  <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
  <Stack.Screen name='Output' component={Output} />



      </Stack.Navigator>

    </NavigationContainer>
  )
}


export default App