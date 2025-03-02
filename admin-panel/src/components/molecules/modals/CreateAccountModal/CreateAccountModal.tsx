import { Avatar, Button, Group, Modal, MultiSelect, PasswordInput, rem, Select, SimpleGrid, Stack, TextInput } from '@mantine/core';
import classes from './CreateAccountModal.module.css';
import useNamespaceTranslation from '../../../../hooks/useNamespaceTranslation';
import { matchesField, useForm } from '@mantine/form';
import { useState } from 'react';

const borderless = {
    input: classes.borderless,
}

export default function CreateAccountModal({ opened, onClose, accountType }): React.JSX.Element {
    const [name, setName] = useState('');

    const { tns } = useNamespaceTranslation('modals');
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            surname: '',
            email: '',
            password: '',
            confirmPassword: '',
            roles: [],
            groups: [],
        },

        validate: {
            confirmPassword: matchesField('password', 'Passwords are not the same')
        }
    })

    const closeModal = () => {
        form.reset();
        onClose();
    }

    const onFormChange = () => {
        const vals = form.getValues();
        setName(`${vals.name} ${vals.surname}`);
    }

    const onFormSubmit = form.onSubmit(values => {
        console.log(values);
        closeModal();
    });

    return (

        <Modal
            opened={opened}
            onClose={closeModal}
            onChange={onFormChange}
            title={tns('custom.create-account.title')}
            size='480'
        >
            <form onSubmit={onFormSubmit}>
            <Stack className={classes.container}>
                <Group align='top' justify='space-between'>
                    <Stack>
                        <TextInput
                            placeholder='Name'
                            w={300}
                            key={form.key('name')}
                            classNames={borderless}
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            placeholder='Surname'
                            w={300}
                            key={form.key('surname')}
                            classNames={borderless}
                            {...form.getInputProps('surname')}
                        />
                        <TextInput
                            placeholder='Email'
                            w={300}
                            key={form.key('email')}
                            classNames={borderless}
                            {...form.getInputProps('email')}
                        />
                    </Stack>
                    <Avatar name={name} size={rem(128)} color={name && 'initials'} />
                </Group>
                <PasswordInput
                    label='Account password'
                    placeholder='Enter password here'
                    key={form.key('password')}
                    {...form.getInputProps('password')}
                    classNames={borderless}
                    flex='3'
                />
                <PasswordInput
                    label='Confirm Password'
                    placeholder='Confirm password here'
                    key={form.key('confirmPassword')}
                    classNames={borderless}
                    {...form.getInputProps('confirmPassword')}
                />
                <Select
                    label='Account type'
                    data={[accountType]}
                    value={accountType}
                    disabled
                    autoFocus={false}
                />
                {accountType === 'Administrative' ? 
                    <MultiSelect
                        clearable
                        checkIconPosition='left'
                        label='Roles:'
                        data={['Machine Manager', 'Account Administrator']}
                        classNames={borderless}
                        placeholder='Select roles'
                        key={form.key('roles')}
                        {...form.getInputProps('roles')}
                        autoFocus
                    /> :
                    <MultiSelect
                        clearable
                        checkIconPosition='left'
                        label='Groups:'
                        data={['4ta2']}
                        classNames={borderless}
                        placeholder='Select groups'
                        key={form.key('groups')}
                        {...form.getInputProps('groups')}
                        autoFocus
                    />
                }
                <SimpleGrid cols={2}>
                    <Button onClick={closeModal} variant='light' color='cherry.9'>Cancel</Button>
                    <Button type='submit' variant='light' color='suse-green.8'>Confirm</Button>
                </SimpleGrid>
            </Stack>
            </form>
        </Modal>
    )

}
