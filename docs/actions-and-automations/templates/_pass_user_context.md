#### Pass user context to the backend

You can access any value in the trigger data structure and add it to the payload. This is particularly useful for passing **user context** to your backend.

Port automatically captures the executing user's information (email, name, ID, etc.) in the trigger data. You can easily pass this information to your backend to implement features like audit trails, personalized workflows, or user-specific logic.

For example, to add the executing user's email to the payload, you can use the following expression:

```json showLineNumbers
{
  "executing_user_email": "{{.trigger.by.user.email}}"
}
```

You can also access other user properties like `{{.trigger.by.user.firstName}}`, `{{.trigger.by.user.lastName}}`, etc. To see all available user properties, you can use the testing method explained below.

