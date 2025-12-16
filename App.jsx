
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { ThemeProvider } from './src/context/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'

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
import FirestoreTest from './src/Screen/FirestoreTest'
import Explore from './src/Screen/Explore'
import DiscoveryDetail from './src/Screen/DiscoveryDetail'
import History from './src/Screen/History'
import LegalScreen from './src/Screen/LegalScreen'

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
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
  <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
  <Stack.Screen name='Signup' component={Signup} options={{ headerShown: false }} />
  <Stack.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
  <Stack.Screen name='ProfileEdit' component={ProfileEdit} options={{ headerShown: false }} />
  <Stack.Screen name='Home' component={Homescreen} options={{ headerShown: false }} />
  <Stack.Screen name='HowItWorks' component={HowItWorks} options={{ headerShown: false }} />
  <Stack.Screen name='About' component={About} options={{ headerShown: false }} />
  <Stack.Screen name='Textinput' component={Textinput} options={{ headerShown: false }} />
  <Stack.Screen name='Imageinput' component={Imageinput} options={{ headerShown: false }} />
  <Stack.Screen name='ForgotPassword' component={ForgotPassword} options={{ headerShown: false }} />
  <Stack.Screen name='Output' component={Output} options={{ headerShown: false }} />
  <Stack.Screen name='FirestoreTest' component={FirestoreTest} options={{ headerShown: false }} />
  <Stack.Screen name='Explore' component={Explore} options={{ headerShown: false }} />
  <Stack.Screen name='DiscoveryDetail' component={DiscoveryDetail} options={{ headerShown: false }} />
  <Stack.Screen name='History' component={History} options={{ headerShown: false }} />
  <Stack.Screen name='LegalScreen' component={LegalScreen} options={{ headerShown: false }} />



      </Stack.Navigator>

    </NavigationContainer>
    </ThemeProvider>
    </AuthProvider>
  )
}


export default App