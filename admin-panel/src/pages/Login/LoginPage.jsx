import { Avatar, Button, Center, Divider, Fieldset, Group, PasswordInput, Space, Text, TextInput } from '@mantine/core';
import { Form, isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import React from 'react';
import useAuth from '../../hooks/useAuth.ts';
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { postRequest } = useApi();
    const { setAccessToken, setRefreshToken } = useAuth();
    const form = useForm({
        mode: 'uncontrolled',
        validate: {
            username: isNotEmpty(),
            password: isNotEmpty(),
        }
    })

    /**
     * @typedef {object} TokenRequestForm
     * @property {string} username
     * @property {string} password
     * 
     * Sends a postRequest request for the token with filled form data
     * @param {TokenRequestForm} values 
     */
    async function authenticate(values) {

        const jsonResponse = await postRequest('/token', new URLSearchParams({
            username: values.username,
            password: values.password,
        }), {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        if (!jsonResponse?.access_token) return;

        setAccessToken(jsonResponse.access_token);
        setRefreshToken(jsonResponse.refresh_token);
        navigate('/virtual-machines');
        notifications.clean();
    }

    return (
        <Center h={'100vh'}>
            <Fieldset w='400'>
                <form onSubmit={form.onSubmit(authenticate)}>
                    <Group align='flex -end' pt='xs'>
                        <Avatar src='/icons/Cherry Admin Panel.webp' radius={0} />
                        <Text size="xl" fw={500}>
                            {t('login.title', {ns: 'pages'})}
                        </Text>
                    </Group>
                    <Space h="sm" />
                    <Divider label={t('login.description', {ns: 'pages'})} />
                    <Space h="sm" />
                    <TextInput
                        label={t('username')}
                        description=" " // for a small gap
                        placeholder={t('login.username-placeholder', {ns: 'pages'})}
                        withAsterisk
                        key={form.key('username')}
                        {...form.getInputProps('username')}
                    />
                    <Space h="sm" />
                    <PasswordInput
                        label={t('password')}
                        description=" " // for a small gap
                        placeholder={t('login.password-placeholder', {ns: 'pages'})}
                        withAsterisk
                        key={form.key('password')}
                        {...form.getInputProps('password')}
                    />
                    <Group justify="space-between" mt="md">
                        <Button
                            onClick={() => navigate('/')}
                            style={{ fontWeight: 500 }}
                            color='dark.1'
                            variant='light'
                        >
                            {t('go-back')}
                        </Button>
                        <Button type="submit">{t('log-in')}</Button>
                    </Group>
                </form>
            </Fieldset>
        </Center>
    )
}
