export interface CardGroupProps {
    children: React.ReactElement[],
    group: string,
    opened: boolean,
    toggleOpened: React.MouseEventHandler,
}