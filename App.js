import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Text, Animated } from 'react-native';



const App = ({}) => {
  const [animation] = useState(new Animated.Value(0));
  const [searchText, setSearchText] = useState('');
  const [apiData, setApiData] = useState([]);

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
        <View style={styles.apiDataContainer}>
          {apiData.length === 0 ? (
            <Text style={styles.loadingText}>No results found</Text>
          ) : (
            apiData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemContainer}
                onPress={() => {
                  navigation.navigate('Detail', { id: item.Id });
                }}
              >
                <Text>{item['Detail.en.Title']}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;
