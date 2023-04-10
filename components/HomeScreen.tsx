import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CurrencyElement from "./CurrencyElement";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { Colors } from "../theme";
import { ThemeContext, ThemeType } from "./ThemeContext";
import i18n from "i18next";
import { IconButton } from "@react-native-material/core";
import { Currency } from "./Currency";
import { Data, getLocalData, updateData } from "./Data";
import InputValueModal from "./InputValueModal";
import { da } from "date-fns/locale";



export function formatLastUpdate(lastUpdate: string | undefined): string {
  if(!lastUpdate)
    return "";
  const date = new Date(lastUpdate);
  return i18n.t("Last update") + ": " + date.toLocaleString() ;
}

function HomeScreen({route, navigation})  {



  const { theme, toggleTheme } = useContext(ThemeContext);

  const [data, setData] = useState<Data>();


  const [selectedCopy, setSelectedCopy] = useState([]);


  const [providedAmount, setProvidedAmount] = useState(1);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {

    console.log(data?.selectedCurrencies.length)

    try {
      const {selectedCurrenciesTest } = route.params;
      if(selectedCurrenciesTest)
        console.log(selectedCurrenciesTest)
    }catch (e) {
      //ignore
    }

    navigation.setOptions(({
      headerTitle: i18n.t('currencyConverter'),
      headerRight: () => (
        <View
          style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <IconButton
            icon={props => (
              <Ionicons
                onPress={() => navigation.navigate('Settings')}
                name="settings-sharp"
                size={24}
                color={Colors[theme]?.white}
              />
            )}
            color="primary"
          />
          <IconButton
            onPress={toggleTheme}
            icon={props => (
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={24}
                color={Colors[theme]?.white}
              />
            )}
            color="primary"
          />
        </View>
      )}));

    fetchData();

  }, [navigation, theme]);


  React.useEffect(() => {

    console.log("DATA was changed")

    console.log(data?.selectedCurrencies.length)

    if(data)
      setSelectedCopy([...data?.selectedCurrencies])

    convertValue(providedAmount);

  }, [data]);

  const onRefresh = React.useCallback(() => {

    console.log("onRefresh HomeScreen: " + data?.selectedCurrencies.length)

  setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {

    console.log("Fetch Data")
    console.log("Data Length: " + data?.selectedCurrencies.length)
    console.log("Copy Length: " + selectedCopy.length)

    try {
      if(!data)
      {
        const localData = await getLocalData();
        setData(localData);
      }

      const newData = await updateData(data);
      setData(newData);
      setRefreshing(false);
    } catch (error) {
      console.error(error);
    }
  };



  const convertValue = (value: number) => {


    if(selectedCurrency) {
      data?.selectedCurrencies.forEach(currency => {

        const rateBase = currency.rate / selectedCurrency?.rate;
        const result = value * rateBase;
        currency.convertedResult = result;
        setProvidedAmount(value);
      })
    }
  }







  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme]?.themeColor,
    },
    titleStyle: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      color: Colors[theme]?.white,
      padding: 10,
    },
    textStyle: {
      fontSize: 16,
      color: Colors[theme]?.white,
      textAlign: 'center',
      padding: 10,
    },
    touchableOpacityStyle: {
      position: 'absolute',
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      bottom: 30,
      backgroundColor: Colors[theme]?.primary,
      borderRadius: 30,
    },
    floatingButtonStyle: {
      resizeMode: 'contain',
      width: 50,
      height: 50,
      //backgroundColor:'black'
    },
    iconContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: 120,
    },



  });

  const setSelectedCurrencies = (selectedCurrencies : Currency[]) => {




   // console.log(selectedCurrencies)
    console.log(data?.selectedCurrencies.length)

/*    setData((prevData) => {
      return ({ ...prevData, selectedCurrencies: selectedCurrencies });
    });*/

    setData({...data, selectedCurrencies: selectedCurrencies})

    console.log(data?.selectedCurrencies.length)

  }

  function selectCurrency(selectedCurrency : Currency) {
    if(!selectedCurrency)
      return
    setSelectedCurrency(selectedCurrency)
    setModalVisible(true);
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>();




  return (
    <SafeAreaView style={styles.container}>

      <InputValueModal selectedCurrency={selectedCurrency} modalVisible={modalVisible} setModalVisible={setModalVisible} convertValue={convertValue} />

      <View style={styles.container}>
        <ScrollView style={{paddingVertical: 5}}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {
            data?.selectedCurrencies.map((currency) =>
              <CurrencyElement onPress={selectCurrency}  currency={currency} theme={theme}/>
            )
          }
          <Text style={{alignSelf: "flex-end", margin: 5, marginHorizontal: 10, color: Colors[theme]?.darkWhite}}>{formatLastUpdate(data?.lastUpdate)}</Text>
        </ScrollView>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Selector', {data: data, setSelectedCurrencies: setSelectedCurrencies })}
          style={styles.touchableOpacityStyle}>
          <MaterialCommunityIcons name="web-plus" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

}

export default HomeScreen;
