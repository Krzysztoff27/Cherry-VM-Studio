import { Flex, Stack, StackProps, Text, Title } from "@mantine/core";
import classes from "../CopyrightPage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { CopyrightPageSlideProps } from "../CopyrightPage";
import { Trans } from "react-i18next";
import cat from "../../../../assets/ascii/cat";
import AsciiArt from "../../../../components/atoms/display/AsciiArt/AsciiArt";
import { CC_BY_NC_ND_4_0 } from "../Licenses";

const ProjectSlide = ({ slide, setSlide, ...props }: CopyrightPageSlideProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("pages", "credits");

    return (
        <Stack
            id="project"
            className={classes.project}
            {...props}
        >
            <Title
                order={1}
                ff="poppins"
            >
                © {tns("project.title")}
            </Title>
            <Text className={classes.description}>
                {tns("project.description.1")}
                {CC_BY_NC_ND_4_0}
            </Text>
            <Text className={classes.description}>
                <Trans
                    i18nKey="pages:credits.project.description.2"
                    components={{
                        branding: (
                            <span
                                onClick={() => setSlide(1)}
                                className={classes.fakeAnchor}
                            />
                        ),
                        thirdParty: (
                            <span
                                onClick={() => setSlide(2)}
                                className={classes.fakeAnchor}
                            />
                        ),
                    }}
                />
            </Text>
            <Flex
                mt="auto"
                justify="end"
                style={{ transform: "scaleX(-1)" }}
            >
                <AsciiArt
                    text={cat}
                    label="Image of a silly cat with an alien-like antenas over it's head"
                />
            </Flex>
        </Stack>
    );
};

export default ProjectSlide;
