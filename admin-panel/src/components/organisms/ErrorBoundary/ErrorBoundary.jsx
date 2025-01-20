import { Button, Center } from "@mantine/core";
import { useNavigate, useRouteError } from "react-router-dom";
import classes from './ErrorBoundary.module.css';
import useAuth from "../../../hooks/useAuth.ts";
import { useTranslation } from "react-i18next";


export default function ErrorBoundary() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const {status, i18nKey, message: detail} = useRouteError(); 

    const code = status || 600;
    let onClick, buttonMessage;
    const message = code >= 600 && detail ? detail : t([`${i18nKey}.message`, `${code}.message`], {ns: 'errors'});
    const title = t([`${i18nKey}.title`, `${code}.title`], {ns: 'errors'});

    switch (code) {
        case 401:
        case 403:
            onClick = logout;
            buttonMessage = t('log-in-again');
            break;
        case 404:
            onClick = () => navigate(-1);
            buttonMessage = t('take-me-back');
            break;
        default:
            onClick = () => navigate(0);
            buttonMessage = t('refresh-page');
    }

    return (
        <>
            <Center className={classes.background}>
                {code}
            </Center>
            <div className={classes.center}>
                <h1 className={classes.title}>{title}</h1>
                <span className={classes.message}>{message}</span>
                <Button
                    onClick={onClick}
                    size='lg'
                    w={220}
                >
                    {buttonMessage}
                </Button>
                <Button
                    onClick={() => navigate('/')}
                    size='compact-sm'
                    variant='subtle'
                    w={220}
                >
                    {t('return-to-home-page')}
                </Button>
            </div>
        </>
    )
}
