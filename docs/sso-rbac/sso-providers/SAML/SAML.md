
import DocCardList from '@theme/DocCardList';

This documentation will describe the process of integrating a SAML application with Port, along with some examples for specific login providers.

In order to integrate Port with a SAML SSO application, you will need to do the following:

1. Create a new SAML application in your login provider.
2. Share with us the following information about your SSO application: X509 certificate (`.pem` or `.crt` file) and Signin URL (as defined in the application).
3. Port will provide you with a metadata XML file that you can upload in the SSO application to complete the connection.
4. Update the application with the following attributes (Port expects the IdP to send the following attributes and their values in the authentication request):
    * User attribute mappings:
        * email : email
        * given_name : firstname
        * family_name : lastname
    * Constant attributes:
        * email_verified : true

If your login provider does not support metadata files, extract the following data from the XML and manually add to your application:

* IdP EntityID = `https://auth.getport.io`
* SP EntityID = The EntityDescriptor field in the XML, looks like : `urn:auth0:port-prod:...` where the `...` is the connection name as provided to you by Port.
* callback URL = The AssertionConsumerService binding field in the XML, looks like : `https://auth.getport.io/login/callback?connection=...` where the `...` is the connection name as provided to you by Port.

<DocCardList/>
