# Backend

![](https://www.bezkoder.com/wp-content/uploads/2020/03/django-mongodb-crud-rest-api-architecture.png)

img src: https://www.bezkoder.com/django-mongodb-crud-rest-framework/

## Usage

In backend folder

* Build backend server

```shell
dash build_backend.sh
```

* Run backend server

```shell
dash run_backend.sh
```

## Common issues

### Certificate issues
If you have the following error message while building the backend,
```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:997)')>]
```
you need to install certificate for python. 

In MacOS, open application folder and find your python version (Python 3.X), run Install Certificates.command shell will install it for you.

## Database 

1. Login mongoDB to view whole database: *dinnerpartyDB*
https://cloud.mongodb.com/v2/62ad98c4a8ff2c7c68f06466#metrics/replicaSet/62b0f9d294602c0ac44a835c/explorer/dinnerpartyDB

2. A quick way to use GET to view User data by visiting http://127.0.0.1:5005/user/auth/users/

3. Django utility: create a super user ```$ python3 src/manage.py createsuperuser``` and visiting http://127.0.0.1:5005/admin/ , all registered data will be there.

## Swagger

Visiting http://127.0.0.1:5005/swagger/ and http://127.0.0.1:5005/redoc/ to see all endpoints and its JSON attributes fields.

## Recipe Recommender System

### Non-personalised

We use the method of [Bayesian inference](https://en.wikipedia.org/wiki/Bayesian_inference) to calculate the recommendation_score of a recipe, so the recommendation_score for a recipe will be based on its average ratings and number of ratings.

We choose a default recommendation score as ```R```, the initial belief .

We make assumption of a typical number of a typical recipe is a fix number ```N```, based on that we choose the weight of ```R``` as ```W```.

Hence the recommendation score is calculated as follows:

```math
    recommendation\_score = \frac{R*W + sum\_ratings}{W + num\_ratings}
```

We used  ```R = 2.3``` and ```W = 5``` in the applications, assuming a typical number of rating for a recipe is around ```20```.
