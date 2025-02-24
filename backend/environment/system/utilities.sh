#!/usr/bin/env bash

#Return OK status only if previous command returned 0 code, otherwise err_handler is invoked
ok_handler(){
    if [ $? == 0 ]; then
        printf "${GREEN}OK${NC}\n"
    fi
}
#Universal function to read dependenies names from a file
read_file(){
    packages=()
    while IFS= read -r line || [[ -n "$line" ]]; do
        packages+=("$line")
    done < "$1"
}
#Error handler to call on SIGINT occurence and print an error message
sigint_handler(){
    printf '\n[!] Script terminated manually!\n'
    exit 1
}