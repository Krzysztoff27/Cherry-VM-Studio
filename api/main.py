import logging


###############################
#      they dont love you like i love you
###############################

logging.getLogger("passlib").setLevel(logging.ERROR)  # silence the error caused by a bug in the bcrypt package

