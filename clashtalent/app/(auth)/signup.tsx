import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SignUp: React.FC<any> = ({ navigation }) => {
    const handleSignUp = () => {
        // پس از ثبت‌نام موفق، کاربر را به صفحه ورود هدایت کنید
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ثبت‌نام</Text>
            <TextInput style={styles.input} placeholder="ایمیل" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="رمز عبور" secureTextEntry />
            <TextInput style={styles.input} placeholder="تکرار رمز عبور" secureTextEntry />
            <Button title="ثبت‌نام" onPress={handleSignUp} />
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                قبلاً حساب کاربری دارید؟ وارد شوید.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    link: {
        color: 'blue',
        marginTop: 10,
    },
});
export default SignUp