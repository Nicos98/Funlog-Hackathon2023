import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Text, Animated, Button, Linking, Image } from 'react-native';


const App = () => {

  const [animation] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState('');
  const [apiData, setApiData] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [titleData, setTitle] = useState([]);
  const [gpsData, setGpsdata] = useState([]);

  const callTourismApi = (searchText, successCallback, errorCallback) => {
    const Http = new XMLHttpRequest();
    const apiUrl = 'https://tourism.opendatahub.com/v1/Find?term=' + searchText + '&language=en&searchbasetext=false&limitto=5&removenullvalues=true';

    console.log(apiUrl);

    Http.open('GET', apiUrl);
    Http.setRequestHeader('Content-type', 'application/json');

    Http.onreadystatechange = function () {
      if (Http.readyState === 4) {
        if (Http.status === 200) {
          const data = JSON.parse(Http.responseText);
          successCallback(data);
        } else {
          errorCallback(new Error(`Error while calling the API: ${Http.status}`));
        }
      }
    };

    Http.onerror = function () {
      errorCallback(new Error('Network error occurred'));
    };

    Http.send();
  };

  const callForDetails = (itemId, successCallback, errorCallback) => {
    const Http = new XMLHttpRequest();
    const apiUrl = 'https://tourism.opendatahub.com/v1/ODHActivityPoi/' + itemId + '?removenullvalues=true';

    console.log(apiUrl);

    Http.open('GET', apiUrl);
    Http.setRequestHeader('Content-type', 'application/json');

    Http.onreadystatechange = function () {
      if (Http.readyState === 4) {
        if (Http.status === 200) {
          const data = JSON.parse(Http.responseText);
          successCallback(data);
        } else {
          errorCallback(new Error(`Error while calling the API: ${Http.status}`));
        }
      }
    };

    Http.onerror = function () {
      errorCallback(new Error('Network error occurred'));
    };

    Http.send();
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    console.log('Search Text:', searchText);
    setShowDetails(false);
    callTourismApi(
      searchText,
      (data) => {
        setApiData(data.Items);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const toggleView = (itemId) => {
    setShowDetails(true);

    callForDetails(
      itemId,
      (data) => {
        var titleString = data.Detail.en.Title;
        var subTitle = titleString.replaceAll(' ', '+');
        setTitle([titleString, subTitle]);
        setGpsdata([data['GpsInfo'][0]['Latitude'], data['GpsInfo'][0]['Longitude']]);
      },
      (error) => {
        console.error(error);
      }
    )
  }

  const backToHome = () => {

  }

  const OpenURLButton = ({url, children}) => {
    const handlePress = useCallback(async () => {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    }, [url]);

    return <Button title={children} onPress={handlePress} />;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Image
          source={require('./assets/logo.png')}
          style={[styles.image, { opacity: animation }]}
          />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Where are we going?"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
        {!showDetails&&<View style={styles.apiDataContainer}>
          {apiData.length === 0 ? (
            <Text style={styles.loadingText}>No results found</Text>
          ) : (
            apiData.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleView(item.Id)}
                style={styles.itemContainer}
              >
                <Text>{item['Detail.en.Title']}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>}
        {showDetails&&<View style={styles.apiDataContainer}>
          <TouchableOpacity
            style={styles.itemContainer}
          >
            <Text>{titleData[0]}</Text>
            <OpenURLButton url={'http://www.openstreetmap.org/?mlat=' + gpsData[0] + '&mlon=' + gpsData[1] + '#map=20/' + gpsData[0] + '/' + gpsData[1]}>Open Location</OpenURLButton>
          </TouchableOpacity>
        </View>}
      </View>
      <View style={styles.footer}>
        <Image
          source={require('./assets/fos.png')} // Sostituisci con il percorso del tuo logo
          style={styles.logo}
        />
        <Text style={styles.footerText}>Copyright © 2023</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    marginTop: 45,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 25,
    marginRight: 20,
  },
  image: {
    width: '80%',
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0c6c0c',
    padding: 8,
    marginLeft: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  apiDataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    flex: 1,
  },
  itemContainer: {
    marginTop: 5,
    backgroundColor: '#f2f3e9',
    borderRadius: 10,
    padding: 10,
    paddingBottom: 15,
    color: 'light-grey',
  },
  input: {
    flex: 1,
    marginRight: 8,
    textShadowColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderColor: 'white',
    alignItems: 'center',

  },
  footerText: {
    alignSelf:'center',
      fontSize: 16,
      color: 'gray',
  },
   logo: {
    alignSelf: 'center',
    width: '40%',
    height: 55,
    marginBottom: 10,
  },
});

export default App;