# Square Cloud Action
Deploy your applications to SquareCloud using Github Actions

# Usage
```yml
- name: Commit to Square Cloud
  uses: richaardev/squarecloud-action@v1.0.0
  with:
    restart: 'true'
    token: '${{ secrets.SQUARE_TOKEN }}'
    application_id: '${{ secrets.APPLICATIONID }}'
```
